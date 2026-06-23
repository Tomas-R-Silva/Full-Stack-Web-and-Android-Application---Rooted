import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'event_detail_screen.dart';

class ConnectionsScreen extends StatefulWidget {
  const ConnectionsScreen({super.key});

  @override
  State<ConnectionsScreen> createState() => _ConnectionsScreenState();
}

class _ConnectionsScreenState extends State<ConnectionsScreen> {
  List<Map<String, dynamic>> _events = [];
  bool _loading = true;
  String? _error;
  String? _username;
  String? _jwt;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    _jwt = await SessionStorage.getJwt();
    _username = await SessionStorage.getUsername();

    if (_jwt == null || _username == null) {
      if (mounted) setState(() { _loading = false; _error = 'Not logged in.'; });
      return;
    }

    try {
      final result = await ApiService.listEvents(
        jwt: _jwt,
        organizerUsername: _username,
        pageSize: 50,
      );
      final data = result['data'] ?? {};
      final events = (data['events'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();
      if (mounted) {
        setState(() {
          _events = events;
          _loading = false;
        });
      }
    } on ApiException catch (e) {
      if (mounted) setState(() { _loading = false; _error = e.message; });
    } catch (_) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Could not reach the server. Pull to refresh.';
        });
      }
    }
  }

  String _formatDate(dynamic epochSeconds) {
    if (epochSeconds == null) return '';
    final dt = DateTime.fromMillisecondsSinceEpoch((epochSeconds as int) * 1000);
    return '${dt.day.toString().padLeft(2, '0')}/'
        '${dt.month.toString().padLeft(2, '0')}/'
        '${dt.year}  '
        '${dt.hour.toString().padLeft(2, '0')}:'
        '${dt.minute.toString().padLeft(2, '0')}';
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'UPCOMING':  return Colors.blue;
      case 'COMPLETED': return Colors.green;
      case 'CANCELLED': return AppTheme.error;
      default:          return Colors.grey;
    }
  }

  IconData _categoryIcon(String? category) {
    switch (category) {
      case 'MUSIC':   return Icons.music_note_rounded;
      case 'SPORTS':  return Icons.sports_soccer_rounded;
      case 'TECH':    return Icons.computer_rounded;
      case 'FOOD':    return Icons.restaurant_rounded;
      case 'ART':     return Icons.palette_rounded;
      case 'CULTURE': return Icons.museum_rounded;
      default:        return Icons.event_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Events'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _load,
            tooltip: 'Refresh',
          ),
        ],
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
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off_rounded, size: 48, color: Colors.grey),
              const SizedBox(height: 12),
              Text(_error!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.textSecondary)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _load,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_events.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.event_busy_rounded, size: 64, color: Colors.grey),
              const SizedBox(height: 16),
              const Text("You haven't created any events yet.",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary)),
              const SizedBox(height: 8),
              const Text('Head to the Create tab to get started.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: AppTheme.textSecondary)),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        itemCount: _events.length,
        itemBuilder: (context, index) => _buildEventCard(_events[index]),
      ),
    );
  }

  Widget _buildEventCard(Map<String, dynamic> event) {
    final status = event['status'] as String?;
    final statusColor = _statusColor(status);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => EventDetailScreen(event: event),
            ),
          ).then((_) => _load()); // refresh on return
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category icon
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _categoryIcon(event['category'] as String?),
                  color: AppTheme.primary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              // Event info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            event['title'] as String? ?? '',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            status ?? '',
                            style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: statusColor),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.calendar_today_outlined,
                            size: 12, color: AppTheme.textSecondary),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(event['startDate']),
                          style: const TextStyle(
                              fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 12, color: AppTheme.textSecondary),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            event['location'] as String? ?? '',
                            style: const TextStyle(
                                fontSize: 12, color: AppTheme.textSecondary),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.people_outline,
                            size: 12, color: AppTheme.textSecondary),
                        const SizedBox(width: 4),
                        Text(
                          '${event['attendeeCount'] ?? 0} attending',
                          style: const TextStyle(
                              fontSize: 12, color: AppTheme.textSecondary),
                        ),
                        const Spacer(),
                        const Icon(Icons.chevron_right_rounded,
                            color: AppTheme.textSecondary, size: 18),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
