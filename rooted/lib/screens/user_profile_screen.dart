import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'event_detail_screen.dart';
import '../widgets/avatar_with_border.dart';

class UserProfileScreen extends StatefulWidget {
  final String username;

  const UserProfileScreen({super.key, required this.username});

  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  Map<String, dynamic>? _userData;
  bool _loading = true;
  String? _error;
  String? _jwt;

  bool _isActionPending = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      _jwt = await SessionStorage.getJwt();

      if (_jwt == null) {
        throw ApiException('Please login to view profiles');
      }

      final data = await ApiService.getUserAccount(
        jwt: _jwt!,
        username: widget.username,
      );

      if (mounted) {
        setState(() {
          _userData = data;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  Future<void> _handleFriendAction() async {
    if (_jwt == null || _userData == null || _isActionPending) return;

    final status = _userData!['friendship'];
    setState(() => _isActionPending = true);

    try {
      if (status == 'NOT_FRIENDS' || status == 'REQUEST_RECIVED') {
        await ApiService.addFriend(jwt: _jwt!, username: widget.username);
      } else if (status == 'FRIENDS' || status == 'REQUEST_SENT') {
        // For 'FRIENDS', we might want a confirmation dialog first
        bool? confirm = true;
        if (status == 'FRIENDS') {
          confirm = await showDialog<bool>(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Unfriend?'),
              content: Text('Are you sure you want to unfriend ${widget.username}?'),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                TextButton(
                  onPressed: () => Navigator.pop(ctx, true),
                  child: const Text('Unfriend', style: TextStyle(color: AppTheme.error)),
                ),
              ],
            ),
          );
        }
        
        if (confirm == true) {
          await ApiService.unfriend(jwt: _jwt!, username: widget.username);
        }
      }
      
      // Reload profile to get new status
      await _loadProfile();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Action failed: $e'), backgroundColor: AppTheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isActionPending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.username),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: AppTheme.error),
            const SizedBox(height: 16),
            Text(_error!, textAlign: TextAlign.center),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: _loadProfile, child: const Text('Retry')),
          ],
        ),
      );
    }

    if (_userData == null) return const SizedBox.shrink();

    final String display = _userData!['display'] ?? _userData!['displayname'] ?? widget.username;
    final String role = _userData!['role'] ?? 'USER';
    final String friendship = _userData!['friendship'] ?? _userData!['friendshipstatus'] ?? 'NOT_FRIENDS';
    final String bio = _userData!['bio'] ?? '';
    final List<String> interests = _userData!['category_list'] as List<String>? ?? [];
    final String? avatarUrl = _userData!['avatar_url'];
    final String? borderId = _userData!['borderID'];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          AvatarWithBorder(
            borderId: borderId,
            imageUrl: avatarUrl,
            radius: 60,
          ),
          const SizedBox(height: 20),
          Text(
            display,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            '@${widget.username}',
            style: const TextStyle(color: AppTheme.textSecondary),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              role,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppTheme.primary,
              ),
            ),
          ),
          const SizedBox(height: 24),
          if (friendship != 'SELF') _buildFriendButton(friendship),
          const SizedBox(height: 32),
          _InfoCard(children: [
            _InfoRow(icon: Icons.info_outline, label: 'Bio', value: bio.isEmpty ? 'No bio provided' : bio),
            const Divider(height: 1),
            _InfoRow(
              icon: Icons.category_outlined,
              label: 'Interests',
              value: interests.isEmpty ? '—' : interests.join(', '),
            ),
            const Divider(height: 1),
            _InfoRow(
              icon: Icons.calendar_today_outlined,
              label: 'Joined',
              value: _formatDate(_userData!['creation_time']),
            ),
          ]),
          const SizedBox(height: 24),
          _buildEventsSection(),
        ],
      ),
    );
  }

  Widget _buildEventsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Upcoming Events',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        FutureBuilder<Map<String, dynamic>>(
          future: ApiService.listEvents(
            organizerUsername: widget.username,
            status: 'UPCOMING',
          ),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return const Text('Error loading events');
            }
            final data = snapshot.data?['data'] ?? snapshot.data ?? {};
            final events = (data['events'] as List? ?? []).cast<Map<String, dynamic>>();

            if (events.isEmpty) {
              return const Text('No upcoming events organized by this user.', style: TextStyle(color: AppTheme.textSecondary));
            }

            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: events.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final event = events[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  tileColor: Theme.of(context).colorScheme.surfaceContainer,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Theme.of(context).colorScheme.outlineVariant.withOpacity(0.5)),
                  ),
                  title: Text(event['title'] ?? 'Untitled', style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(event['location'] ?? 'No location', maxLines: 1, overflow: TextOverflow.ellipsis),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => EventDetailScreen(event: event)),
                    );
                  },
                );
              },
            );
          },
        ),
      ],
    );
  }

  Widget _buildFriendButton(String status) {
    String label = 'Add Friend';
    IconData icon = Icons.person_add_outlined;
    Color color = AppTheme.primary;
    bool isOutlined = false;

    switch (status) {
      case 'FRIENDS':
        label = 'Friends';
        icon = Icons.check_circle_outline;
        isOutlined = true;
        break;
      case 'REQUEST_SENT':
        label = 'Request Sent';
        icon = Icons.hourglass_empty;
        isOutlined = true;
        break;
      case 'REQUEST_RECIVED':
        label = 'Accept Request';
        icon = Icons.person_add;
        color = Colors.green;
        break;
    }

    if (_isActionPending) {
      return const SizedBox(
        height: 48,
        width: 48,
        child: Padding(
          padding: EdgeInsets.all(8.0),
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      );
    }

    if (isOutlined) {
      return OutlinedButton.icon(
        onPressed: _handleFriendAction,
        icon: Icon(icon, size: 18),
        label: Text(label),
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          side: BorderSide(color: color),
          foregroundColor: color,
        ),
      );
    }

    return ElevatedButton.icon(
      onPressed: _handleFriendAction,
      icon: Icon(icon, size: 18),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        minimumSize: const Size.fromHeight(48),
        backgroundColor: color,
        foregroundColor: Colors.white,
      ),
    );
  }

  String _formatDate(dynamic epochSeconds) {
    if (epochSeconds == null || epochSeconds == 0) return '—';
    try {
      final dt = DateTime.fromMillisecondsSinceEpoch((epochSeconds as int) * 1000);
      final months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
    } catch (_) {
      return '—';
    }
  }
}

class _InfoCard extends StatelessWidget {
  final List<Widget> children;
  const _InfoCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainer,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant.withOpacity(0.5)),
      ),
      child: Column(children: children),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 11,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(value,
                    style: TextStyle(
                        fontSize: 15,
                        color: Theme.of(context).colorScheme.onSurface,
                        fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
