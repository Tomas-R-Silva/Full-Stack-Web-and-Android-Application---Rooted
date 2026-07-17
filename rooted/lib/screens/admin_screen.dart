import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'user_profile_screen.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String? _jwt;
  bool _isLoading = true;

  List<dynamic> _users = [];
  List<dynamic> _sessions = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAll();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAll() async {
    setState(() => _isLoading = true);
    try {
      _jwt = await SessionStorage.getJwt();
      if (_jwt == null) throw ApiException('Not logged in');

      // Load Users
      final usersData = await ApiService.showUsers(jwt: _jwt!);
      _users = usersData['users'] as List? ?? [];

      // Load Sessions
      final sessionsData = await ApiService.showAuthSessions(jwt: _jwt!);
      _sessions = sessionsData['tokens'] as List? ?? [];

      if (mounted) setState(() => _isLoading = false);
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _changeRole(String username, String currentRole) async {
    final List<String> roles = ['USER', 'BOFFICER', 'ADMIN', 'PARTNER'];
    String? selectedRole = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Change role for @$username'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: roles.map((r) => RadioListTile<String>(
            title: Text(r),
            value: r,
            groupValue: currentRole,
            onChanged: (val) => Navigator.pop(ctx, val),
          )).toList(),
        ),
      ),
    );

    if (selectedRole != null && selectedRole != currentRole && _jwt != null) {
      try {
        await ApiService.changeUserRole(
          jwt: _jwt!,
          username: username,
          newRole: selectedRole,
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Role updated for @$username')),
          );
          _loadAll();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.error),
          );
        }
      }
    }
  }

  Future<void> _resetFriendships() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reset All Friendships?'),
        content: const Text(
          'This will DELETE ALL friendship links and related forum posts across the entire system. '
          'This action is IRREVERSIBLE.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('RESET ALL', style: TextStyle(color: AppTheme.error)),
          ),
        ],
      ),
    );

    if (confirm == true && _jwt != null) {
      try {
        await ApiService.endFriendships(jwt: _jwt!);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('All friendships have been reset')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed: $e'), backgroundColor: AppTheme.error),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'Users', icon: Icon(Icons.people)),
            Tab(text: 'Sessions', icon: Icon(Icons.security)),
            Tab(text: 'Tools', icon: Icon(Icons.settings_suggest)),
          ],
        ),
        actions: [
          IconButton(onPressed: _loadAll, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildUsersTab(),
                    _buildSessionsTab(),
                    _buildToolsTab(),
                  ],
                ),
    );
  }

  Widget _buildUsersTab() {
    if (_users.isEmpty) return const Center(child: Text('No users found'));
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _users.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final user = _users[index] as Map<String, dynamic>;
        final uname = user['username'] ?? 'Unknown';
        final display = user['display'] ?? uname;
        final role = user['role'] ?? 'USER';

        return ListTile(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => UserProfileScreen(username: uname)),
          ),
          leading: CircleAvatar(
            backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
            child: Text(uname[0].toUpperCase()),
          ),
          title: Text(display, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text('@$uname • $role'),
          trailing: IconButton(
            icon: const Icon(Icons.edit_attributes_outlined, color: AppTheme.primary),
            onPressed: () => _changeRole(uname, role),
            tooltip: 'Change Role',
          ),
        );
      },
    );
  }

  Widget _buildSessionsTab() {
    if (_sessions.isEmpty) return const Center(child: Text('No active sessions'));
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _sessions.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final session = _sessions[index] as Map<String, dynamic>;
        final uname = session['username'] ?? 'Unknown';
        final role = session['role'] ?? '';
        final issued = session['issuedAt'] ?? 0;
        final expires = session['expiresAt'] ?? 0;

        return ListTile(
          leading: const Icon(Icons.vpn_key_outlined, color: Colors.orange),
          title: Text('@$uname ($role)'),
          subtitle: Text(
            'Issued: ${_formatTs(issued)}\nExpires: ${_formatTs(expires)}',
            style: const TextStyle(fontSize: 12),
          ),
          isThreeLine: true,
        );
      },
    );
  }

  Widget _buildToolsTab() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'System Maintenance',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Card(
            color: AppTheme.error.withValues(alpha: 0.05),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: AppTheme.error, width: 0.5),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Reset Friendships',
                    style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.error),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Wipes all friendship entities and friend-related forum posts. Use only if database integrity is compromised.',
                    style: TextStyle(fontSize: 13),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _resetFriendships,
                    icon: const Icon(Icons.warning_amber_rounded),
                    label: const Text('Execute System Reset'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.error,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTs(dynamic ts) {
    if (ts == null || ts == 0) return 'N/A';
    final dt = DateTime.fromMillisecondsSinceEpoch((ts as int) * 1000);
    return dt.toString().split('.')[0];
  }
}
