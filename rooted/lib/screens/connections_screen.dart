import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'login_screen.dart';
import 'user_profile_screen.dart';
import 'chat_screen.dart';

class ConnectionsScreen extends StatefulWidget {
  const ConnectionsScreen({super.key});

  @override
  State<ConnectionsScreen> createState() => _ConnectionsScreenState();
}

class _ConnectionsScreenState extends State<ConnectionsScreen> {
  String? _jwt;
  String? _username;
  bool _isLoading = true;

  List<dynamic> _friends = [];
  List<dynamic> _requests = [];
  List<Map<String, dynamic>> _filteredSuggested = [];
  bool _isSearchingSuggestions = false;
  String? _processingUsername;
  
  final TextEditingController _searchController = TextEditingController();
  Timer? _searchDebounce;

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
    _loadData();
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    _searchDebounce?.cancel();
    final query = _searchController.text.trim();
    if (query.isEmpty) {
      setState(() => _filteredSuggested = []);
    } else {
      _searchDebounce = Timer(const Duration(milliseconds: 500), () {
        _performServerSearch(query);
      });
    }
  }

  Future<void> _performServerSearch(String query) async {
    if (_jwt == null) return;
    
    setState(() => _isSearchingSuggestions = true);
    
    try {
      // First attempt with original query
      var list = await _fetchSearchResults(query);
      
      // Fallback: If no results, try capitalized (for case-sensitive backends)
      if (list.isEmpty && query.length == 1) {
        final altQuery = query.toUpperCase();
        if (altQuery != query) {
          list = await _fetchSearchResults(altQuery);
        }
      }
                   
      if (mounted) {
        setState(() {
          _filteredSuggested = list.where((u) {
            final name = (u['username'] ?? u['user_name'] ?? u['display'] ?? '').toString();
            if (name.isEmpty) return false;
            return name.toLowerCase() != _username?.toLowerCase();
          }).toList();
        });
      }
    } catch (_) {
      // Ignore search errors in background
    } finally {
      if (mounted) setState(() => _isSearchingSuggestions = false);
    }
  }

  Future<List<Map<String, dynamic>>> _fetchSearchResults(String query) async {
    final result = await ApiService.findUsers(jwt: _jwt!, username: query);
    final rawList = (result['found'] as List<dynamic>?) ?? 
                    (result['users'] as List<dynamic>?) ?? 
                    (result['data'] as List<dynamic>?) ?? [];
                    
    return rawList.map((u) {
      if (u is Map) return Map<String, dynamic>.from(u);
      return {'username': u.toString()};
    }).toList();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      _jwt = await SessionStorage.getJwt();
      _username = await SessionStorage.getUsername();

      if (_jwt == null || _username == null) {
        if (mounted) setState(() => _isLoading = false);
        return;
      }

      // Fetch friends and requests using the correct backend keys
      final friendsResult = await ApiService.showFriends(jwt: _jwt!, username: _username!);
      final requestsResult = await ApiService.showFriendRequests(jwt: _jwt!);
      
      // showfriends returns {"friends": [{"Friend": "username", "Start": ...}]}
      final friendsList = friendsResult['friends'] as List<dynamic>? ?? [];
      
      // showfriendrequests returns {"friends": [{"From": "username", "Sent at": ...}]}
      final requestsList = requestsResult['friends'] as List<dynamic>? ?? [];

      final currentFriendsSet = friendsList
          .map((f) => (f is Map) ? (f['Friend'] as String? ?? '') : f.toString())
          .where((name) => name.isNotEmpty)
          .toSet();

      // Fetch upcoming events to generate recommendations (event organizers)
      final eventsResult = await ApiService.listEvents(jwt: _jwt, status: 'UPCOMING', pageSize: 50);
      final eventsData = eventsResult['events'] as List<dynamic>? ?? [];
      final events = eventsData.cast<Map<String, dynamic>>();
      
      for (var e in events) {
        final org = e['organizerUsername'] as String?;
        if (org != null && org != _username && !currentFriendsSet.contains(org)) {
          // organizers.add(org); // No longer needed as we use server-side search
        }
      }

      if (mounted) {
        setState(() {
          _friends = friendsList;
          _requests = requestsList;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  Future<void> _addFriend({String? targetUsername}) async {
    final target = targetUsername ?? _searchController.text.trim();
    if (target.isEmpty) return;
    if (_jwt == null) {
      _showLoginPrompt();
      return;
    }

    setState(() => _processingUsername = target);
    try {
      await ApiService.addFriend(jwt: _jwt!, username: target);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Friend request processed for $target'),
            backgroundColor: Theme.of(context).colorScheme.primary,
            duration: const Duration(seconds: 2),
          ),
        );
        _searchController.clear();
        await _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _processingUsername = null);
    }
  }

  Future<void> _unfriend(String target) async {
    if (_jwt == null) return;
    setState(() => _processingUsername = target);
    try {
      await ApiService.unfriend(jwt: _jwt!, username: target);
      await _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _processingUsername = null);
    }
  }

  Future<void> _setNickname(String target) async {
    final controller = TextEditingController();
    final newNickname = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Set Nickname for $target'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Enter nickname'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Save')),
        ],
      ),
    );

    if (newNickname != null && newNickname.isNotEmpty) {
      try {
        await ApiService.addNickname(jwt: _jwt!, username: target, nickname: newNickname);
        _loadData();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to set nickname: $e'),
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
        }
      }
    }
  }

  void _showLoginPrompt() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Please login to connect with friends'),
        action: SnackBarAction(
          label: 'Login',
          onPressed: () {
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => const LoginScreen()),
              (route) => false,
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Show loader first while checking session and loading data
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Social Hub')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    // After loading, if no session was found, show login prompt
    if (_jwt == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Social Hub')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.people_outline, size: 80, color: Colors.grey),
              const SizedBox(height: 16),
              const Text('Login to see your friends and connections.'),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _showLoginPrompt,
                child: const Text('Login'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Social Hub'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _buildSearchSection(),
            if (_searchController.text.isNotEmpty && _filteredSuggested.isNotEmpty)
              _buildLiveRecommendations(),
            const SizedBox(height: 24),
            
            // Incoming Friend Requests Section
            if (_requests.isNotEmpty) ...[
              _buildSectionTitle('Friend Requests'),
              const SizedBox(height: 12),
              ..._requests.map((r) => _buildRequestTile(r)),
              const SizedBox(height: 24),
            ],

            // Friends List Section
            _buildSectionTitle('Your Friends'),
            const SizedBox(height: 12),
            if (_friends.isEmpty)
              Center(child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Text('No friends yet. Search above to add some!', style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant)),
              ))
            else
              ..._friends.map((f) => _buildFriendTile(f)),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onSurface),
    );
  }

  Widget _buildSearchSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Add Friend'),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search by username...',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surfaceContainer,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                onSubmitted: (val) => _addFriend(),
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              width: 56,
              height: 56,
              child: ElevatedButton(
                onPressed: () => _addFriend(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Theme.of(context).colorScheme.onPrimary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: EdgeInsets.zero,
                ),
                child: const Icon(Icons.add),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLiveRecommendations() {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainer,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          if (_isSearchingSuggestions)
            const Padding(
              padding: EdgeInsets.all(12),
              child: Center(
                child: SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
          ..._filteredSuggested.map((user) {
            final uname = (user['username'] ?? user['user_name'] ?? '').toString();
            final display = user['display']?.toString() ?? uname;
            
            return ListTile(
              dense: true,
              leading: Icon(Icons.person_add_alt_1, color: Theme.of(context).colorScheme.primary, size: 20),
              title: Text(display, style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: display != uname ? Text('@$uname', style: const TextStyle(fontSize: 11)) : null,
              trailing: const Icon(Icons.chevron_right, size: 16),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => UserProfileScreen(username: uname)),
                );
              },
            );
          }),
        ],
      ),
    );
  }

  Widget _buildFriendTile(dynamic friend) {
    // Backend returns: {"Friend": "username", "Start": ...}
    final String uname = (friend is Map) ? (friend['Friend'] ?? 'Unknown') : friend.toString();
    final String? nickname = (friend is Map) ? friend['nickname'] : null;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainer,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ListTile(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => ChatScreen(friendUsername: uname)),
          );
        },
        leading: CircleAvatar(
          backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
          child: Text(uname.isNotEmpty ? uname[0].toUpperCase() : '?', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontWeight: FontWeight.bold)),
        ),
        title: Text(nickname ?? uname, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: nickname != null ? Text('@$uname', style: const TextStyle(fontSize: 12)) : null,
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'unfriend') _unfriend(uname);
            if (value == 'nickname') _setNickname(uname);
          },
          itemBuilder: (context) => [
            const PopupMenuItem(value: 'nickname', child: Text('Set Nickname')),
            PopupMenuItem(value: 'unfriend', child: Text('Unfriend', style: TextStyle(color: Theme.of(context).colorScheme.error))),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestTile(dynamic request) {
    // Backend returns: {"From": "username", "Sent at": ...}
    final String uname = (request is Map) ? (request['From'] ?? 'Unknown') : request.toString();
    final bool isProcessing = _processingUsername == uname;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainer,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.primary.withOpacity(0.1)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: Theme.of(context).colorScheme.primary,
            child: InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => UserProfileScreen(username: uname)),
                );
              },
              child: Text(uname.isNotEmpty ? uname[0].toUpperCase() : '?', style: const TextStyle(color: Colors.white)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => UserProfileScreen(username: uname)),
                );
              },
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(uname, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text('Friend Request', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                ],
              ),
            ),
          ),
          if (isProcessing)
            SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2, color: Theme.of(context).colorScheme.primary),
            )
          else ...[
            _requestAction(
              icon: Icons.check_rounded,
              label: 'Accept',
              color: Colors.green,
              onTap: () => _addFriend(targetUsername: uname),
            ),
            const SizedBox(width: 8),
            _requestAction(
              icon: Icons.close_rounded,
              label: 'Reject',
              color: Theme.of(context).colorScheme.error,
              onTap: () => _unfriend(uname),
            ),
          ],
        ],
      ),
    );
  }

  Widget _requestAction({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(
        backgroundColor: color.withValues(alpha: 0.1),
        foregroundColor: color,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
