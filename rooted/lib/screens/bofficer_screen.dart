import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'event_detail_screen.dart';
import 'user_profile_screen.dart';
import '../widgets/partner_mark.dart';

class BusinessOfficerScreen extends StatefulWidget {
  const BusinessOfficerScreen({super.key});

  @override
  State<BusinessOfficerScreen> createState() => _BusinessOfficerScreenState();
}

class _BusinessOfficerScreenState extends State<BusinessOfficerScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String? _jwt;
  bool _isLoading = true;

  List<dynamic> _users = [];
  List<dynamic> _events = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
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

      // Load Events
      final eventsData = await ApiService.listEvents(jwt: _jwt!, pageSize: 100);
      _events = eventsData['events'] as List? ?? [];

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Business Dashboard'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: Colors.white,
          tabs: const [
            Tab(text: 'Users', icon: Icon(Icons.people_outline)),
            Tab(text: 'Events Oversight', icon: Icon(Icons.business_center_outlined)),
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
                    _buildEventsTab(),
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
            backgroundColor: Colors.teal.withValues(alpha: 0.1),
            child: Text(uname[0].toUpperCase(), style: const TextStyle(color: Colors.teal)),
          ),
          title: Row(
            children: [
              Text(display, style: const TextStyle(fontWeight: FontWeight.bold)),
              PartnerMark(role: role, size: 16),
            ],
          ),
          subtitle: Text('@$uname • $role'),
          trailing: const Icon(Icons.chevron_right, size: 18, color: Colors.grey),
        );
      },
    );
  }

  Widget _buildEventsTab() {
    if (_events.isEmpty) return const Center(child: Text('No events found'));
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _events.length,
      separatorBuilder: (context, index) => const Divider(),
      itemBuilder: (context, index) {
        final ev = _events[index] as Map<String, dynamic>;
        final title = ev['title'] ?? 'Untitled';
        final status = ev['status'] ?? 'UNKNOWN';
        final organizer = ev['organizerUsername'] ?? 'Unknown';

        return ListTile(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => EventDetailScreen(event: ev))),
          title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          subtitle: Text('Organizer: @$organizer\nStatus: $status'),
          isThreeLine: true,
          trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.teal),
        );
      },
    );
  }
}
