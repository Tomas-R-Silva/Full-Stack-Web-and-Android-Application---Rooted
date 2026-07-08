import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'login_screen.dart';

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
  List<String> _suggested = [];
  List<String> _filteredSuggested = [];
  String? _processingUsername;
  
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
    _loadData();
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredSuggested = _suggested;
      } else {
        _filteredSuggested = _suggested
            .where((u) => u.toLowerCase().contains(query))
            .toList();
      }
    });
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
      
      final Set<String> organizers = {};
      for (var e in events) {
        final org = e['organizerUsername'] as String?;
        if (org != null && org != _username && !currentFriendsSet.contains(org)) {
          organizers.add(org);
        }
      }

      if (mounted) {
        setState(() {
          _friends = friendsList;
          _requests = requestsList;
          _suggested = organizers.toList();
          _filteredSuggested = _suggested;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.error),
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
            backgroundColor: AppTheme.primary,
            duration: const Duration(seconds: 2),
          ),
        );
        _searchController.clear();
        await _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.error),
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
          SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.error),
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
            SnackBar(content: Text('Failed to set nickname: $e'), backgroundColor: AppTheme.error),
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
      backgroundColor: AppTheme.background,
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
              const Center(child: Padding(
                padding: EdgeInsets.symmetric(vertical: 20),
                child: Text('No friends yet. Search above to add some!', style: TextStyle(color: AppTheme.textSecondary)),
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
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textPrimary),
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
                  fillColor: Colors.white,
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
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: _filteredSuggested.take(3).map((uname) => ListTile(
          dense: true,
          leading: const Icon(Icons.person_add_alt_1, color: AppTheme.primary, size: 20),
          title: Text(uname, style: const TextStyle(fontWeight: FontWeight.w600)),
          trailing: const Icon(Icons.chevron_right, size: 16),
          onTap: () => _addFriend(targetUsername: uname),
        )).toList(),
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
        color: Colors.white,
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
        leading: CircleAvatar(
          backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
          child: Text(uname.isNotEmpty ? uname[0].toUpperCase() : '?', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
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
            const PopupMenuItem(value: 'unfriend', child: Text('Unfriend', style: TextStyle(color: AppTheme.error))),
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.primary.withValues(alpha: 0.1)),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppTheme.primary,
            child: Text(uname.isNotEmpty ? uname[0].toUpperCase() : '?', style: const TextStyle(color: Colors.white)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(uname, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const Text('Friend Request', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
              ],
            ),
          ),
          if (isProcessing)
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary),
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
              color: AppTheme.error,
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
