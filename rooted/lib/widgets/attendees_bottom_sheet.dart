import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../screens/user_profile_screen.dart';

class AttendeesBottomSheet extends StatefulWidget {
  final String eventId;
  final String jwt;

  const AttendeesBottomSheet({
    super.key,
    required this.eventId,
    required this.jwt,
  });

  @override
  State<AttendeesBottomSheet> createState() => _AttendeesBottomSheetState();
}

class _AttendeesBottomSheetState extends State<AttendeesBottomSheet> {
  List<dynamic> _attendees = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadAttendees();
  }

  Future<void> _loadAttendees() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await ApiService.getAttendees(
        jwt: widget.jwt,
        eventId: widget.eventId,
      );
      // Backend returns: {"attendees": [{"username": "...", "display": "...", "role": "..."}, ...], "count": ...}
      final list = result['attendees'] as List<dynamic>? ?? [];
      if (mounted) {
        setState(() {
          _attendees = list;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load attendees';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.6,
      padding: const EdgeInsets.symmetric(vertical: 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                const Text(
                  'Attendees',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Text(
                  '${_attendees.length} people',
                  style: const TextStyle(color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
          const Divider(height: 32),
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_error!, style: const TextStyle(color: AppTheme.error)),
            TextButton(onPressed: _loadAttendees, child: const Text('Retry')),
          ],
        ),
      );
    }
    if (_attendees.isEmpty) {
      return const Center(
        child: Text('No attendees yet.', style: TextStyle(color: AppTheme.textSecondary)),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      itemCount: _attendees.length,
      itemBuilder: (context, index) {
        final user = _attendees[index] as Map<String, dynamic>;
        final username = user['username'] as String? ?? 'Unknown';
        final display = user['display'] as String? ?? username;
        final role = user['role'] as String? ?? 'USER';

        return ListTile(
          leading: CircleAvatar(
            backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
            child: Text(
              display.isNotEmpty ? display[0].toUpperCase() : '?',
              style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
            ),
          ),
          title: Text(display, style: const TextStyle(fontWeight: FontWeight.w600)),
          subtitle: Text('@$username • $role', style: const TextStyle(fontSize: 12)),
          trailing: const Icon(Icons.chevron_right, size: 20),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => UserProfileScreen(username: username)),
            );
          },
        );
      },
    );
  }
}
