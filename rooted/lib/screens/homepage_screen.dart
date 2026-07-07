import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'event_detail_screen.dart';
import 'login_screen.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String? _username;
  String? _jwt;

  bool _loading = true;
  String? _error;

  List<Map<String, dynamic>> _events = [];

  // Track which eventIds are currently being joined/left
  final Set<String> _pendingIds = {};

  @override
  void initState() {
    super.initState();
    ApiService.eventUpdateNotifier.addListener(_onEventUpdate);
    _init();
  }

  @override
  void dispose() {
    ApiService.eventUpdateNotifier.removeListener(_onEventUpdate);
    super.dispose();
  }

  void _onEventUpdate() {
    if (mounted) {
      _loadEvents();
    }
  }

  Future<void> _init() async {
    _username = await SessionStorage.getUsername();
    _jwt      = await SessionStorage.getJwt();
    await _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() { _loading = true; _error = null; });
    try {
      final result = await ApiService.listEvents(
        jwt: _jwt,
        status: 'UPCOMING',
        pageSize: 20,
      );
      final data   = result;
      final events = (data['events'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();

      // Filter out events user is already attending so they don't show up in the feed
      // But keep them if they were organized by the current user
      events.removeWhere((e) => e['_attending'] == true && e['organizerUsername'] != _username);

      // Sort by startDate ascending (soonest first)
      events.sort((a, b) {
        final aDate = (a['startDate'] as int?) ?? 0;
        final bDate = (b['startDate'] as int?) ?? 0;
        return aDate.compareTo(bDate);
      });

      if (mounted) setState(() { _events = events; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Could not load events.'; _loading = false; });
    }
  }

  Future<void> _toggleAttend(Map<String, dynamic> event) async {
    if (_jwt == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please login to join events'),
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
      return;
    }
    final eventId = event['eventId'] as String;
    final isAttending = event['_attending'] == true;

    setState(() => _pendingIds.add(eventId));
    try {
      if (isAttending) {
        await ApiService.unattendEvent(jwt: _jwt!, eventId: eventId, username: _username);
        if (mounted) {
          setState(() {
            event['_attending'] = false;
            final count = (event['attendeeCount'] as int? ?? 1) - 1;
            event['attendeeCount'] = count < 0 ? 0 : count;
          });
        }
      } else {
        await ApiService.attendEvent(jwt: _jwt!, eventId: eventId, username: _username);
        ApiService.notifyEventUpdate(eventId);
        if (mounted) {
          setState(() {
            event['_attending'] = true;
            event['attendeeCount'] = (event['attendeeCount'] as int? ?? 0) + 1;
          });
        }
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppTheme.error),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not reach the server. Please try again.'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _pendingIds.remove(eventId));
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  String _formatDate(dynamic epochSeconds) {
    if (epochSeconds == null) return '';
    final dt = DateTime.fromMillisecondsSinceEpoch((epochSeconds as int) * 1000);
    final months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${months[dt.month - 1]} ${dt.day}, ${dt.year}  '
        '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  String _categoryEmoji(String? category) {
    switch (category) {
      case 'MUSIC':     return '🎵';
      case 'SPORTS':    return '⚽';
      case 'TECH':      return '💻';
      case 'ART':       return '🎨';
      case 'FOOD':      return '🍔';
      case 'BUSINESS':  return '💼';
      case 'COMMUNITY': return '🤝';
      default:          return '📌';
    }
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _loadEvents,
        color: AppTheme.primary,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildHeader()),
            if (_loading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (_error != null)
              SliverFillRemaining(child: _buildError())
            else if (_events.isEmpty)
              SliverFillRemaining(child: _buildEmpty())
            else ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                  child: Text(
                    'Upcoming Events',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
              ),
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _buildEventCard(_events[index]),
                  childCount: _events.length,
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${_greeting()}, ${_username ?? 'Guest'} 👋',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _jwt == null
                ? 'Login to join events and connect with others.'
                : 'Here\'s what\'s coming up around you.',
            style: const TextStyle(fontSize: 14, color: AppTheme.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildEventCard(Map<String, dynamic> event) {
    final eventId      = event['eventId'] as String? ?? '';
    final title        = event['title'] as String? ?? '';
    final category     = event['category'] as String?;
    final location     = event['location'] as String? ?? '';
    final startDate    = event['startDate'];
    final attendeeCount = event['attendeeCount'] as int? ?? 0;
    final maxAttendees  = event['maxAttendees'] as int? ?? 0;
    final isPublic      = event['isPublic'] as bool? ?? true;
    final isAttending   = event['_attending'] == true;
    final isPending     = _pendingIds.contains(eventId);
    final isFull        = maxAttendees > 0 && attendeeCount >= maxAttendees;
    final isOwn         = event['organizerUsername'] == _username;
    final imageUrls     = event['imageUrls'] as List<dynamic>?;
    final firstImage    = (imageUrls != null && imageUrls.isNotEmpty) ? imageUrls.first as String : null;

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => EventDetailScreen(event: event)),
      ),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.inputBorder),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (firstImage != null)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: Image.network(
                  firstImage,
                  height: 140,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    height: 4,
                    color: AppTheme.primary.withValues(alpha: 0.7),
                  ),
                ),
              )
            else
              // Card header — category colour bar if no image
              Container(
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.7),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category + visibility badges
                  Row(
                    children: [
                      _badge(
                        '${_categoryEmoji(category)} ${_toTitleCase(category ?? 'Other')}',
                        AppTheme.primary.withValues(alpha: 0.08),
                        AppTheme.primary,
                      ),
                      const SizedBox(width: 6),
                      if (!isPublic)
                        _badge('🔒 Private', Colors.orange.shade50, Colors.orange.shade700),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Title
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Date
                  _metaRow(Icons.calendar_today_outlined, _formatDate(startDate)),
                  const SizedBox(height: 4),

                  // Location
                  if (location.isNotEmpty)
                    _metaRow(Icons.location_on_outlined, location),
                  const SizedBox(height: 4),

                  // Attendees
                  _metaRow(
                    Icons.people_outline_rounded,
                    maxAttendees > 0
                        ? '$attendeeCount / $maxAttendees attending'
                        : '$attendeeCount attending',
                  ),
                  const SizedBox(height: 12),

                  // Join / Leave button
                  if (!isOwn)
                    SizedBox(
                      width: double.infinity,
                      child: _joinButton(
                        eventId: eventId,
                        isAttending: isAttending,
                        isPending: isPending,
                        isFull: isFull,
                        event: event,
                      ),
                    ),

                  if (isOwn)
                    Row(
                      children: [
                        const Icon(Icons.star_rounded,
                            size: 14, color: AppTheme.primary),
                        const SizedBox(width: 4),
                        const Text(
                          'Your event',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppTheme.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _joinButton({
    required String eventId,
    required bool isAttending,
    required bool isPending,
    required bool isFull,
    required Map<String, dynamic> event,
  }) {
    if (isPending) {
      return OutlinedButton(
        onPressed: null,
        child: const SizedBox(
          height: 16, width: 16,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      );
    }

    if (isAttending) {
      return OutlinedButton.icon(
        onPressed: () => _toggleAttend(event),
        icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
        label: const Text('Joined'),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppTheme.primary,
          side: const BorderSide(color: AppTheme.primary),
          minimumSize: const Size.fromHeight(38),
          textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        ),
      );
    }

    if (isFull) {
      return OutlinedButton(
        onPressed: null,
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(38),
          textStyle: const TextStyle(fontSize: 13),
        ),
        child: const Text('Event full'),
      );
    }

    return ElevatedButton.icon(
      onPressed: () => _toggleAttend(event),
      icon: const Icon(Icons.add_rounded, size: 16),
      label: const Text('Join Event'),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(38),
        textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _metaRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 13, color: AppTheme.textSecondary),
        const SizedBox(width: 5),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _badge(String label, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: fg),
      ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.wifi_off_rounded, size: 48, color: Colors.grey),
          const SizedBox(height: 12),
          Text(_error!, style: const TextStyle(color: AppTheme.textSecondary)),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadEvents, child: const Text('Retry')),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.event_busy_rounded, size: 56, color: Colors.grey),
          const SizedBox(height: 12),
          const Text(
            'No upcoming events yet.\nCheck back soon!',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 15),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _loadEvents,
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Refresh'),
          ),
        ],
      ),
    );
  }

  String _toTitleCase(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1).toLowerCase();
  }
}
