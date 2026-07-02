import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'event_detail_screen.dart';
import 'login_screen.dart';

class ConnectionsScreen extends StatefulWidget {
  const ConnectionsScreen({super.key});

  @override
  State<ConnectionsScreen> createState() => _ConnectionsScreenState();
}

class _ConnectionsScreenState extends State<ConnectionsScreen> {
  List<Map<String, dynamic>> _events = [];
  int _currentIndex = 0;
  bool _loading = true;
  String? _error;
  String? _jwt;
  String? _username;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() {
      _loading = true;
      _error = null;
      _currentIndex = 0;
    });

    try {
      _jwt = await SessionStorage.getJwt();
      _username = await SessionStorage.getUsername();

      final result = await ApiService.listEvents(
        jwt: _jwt,
        status: 'UPCOMING',
        pageSize: 50,
      );
      
      final data = result['data'] ?? result;
      final events = (data['events'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();

      // Filter out events user is already organizing (optional, but makes sense for "discovery")
      // and sort by date.
      events.removeWhere((e) => e['organizerUsername'] == _username);
      
      // Also filter out events user is already attending
      events.removeWhere((e) => e['_attending'] == true);

      if (mounted) {
        setState(() {
          _events = events;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Could not load events.';
          _loading = false;
        });
      }
    }
  }

  Future<void> _handleSwipeRight(Map<String, dynamic> event) async {
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
      _nextCard();
      return;
    }
    
    // Join event logic
    try {
      final eventId = event['eventId'] as String;
      await ApiService.attendEvent(jwt: _jwt!, eventId: eventId);
      ApiService.notifyEventUpdate(eventId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Joined ${event['title']}!'),
            backgroundColor: AppTheme.primary,
            duration: const Duration(seconds: 1),
          ),
        );
        // Navigate to details after joining
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => EventDetailScreen(event: event)),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to join event'), backgroundColor: AppTheme.error),
        );
      }
    }
    
    _nextCard();
  }

  void _nextCard() {
    setState(() {
      _currentIndex++;
    });
  }

  String _formatDate(dynamic epochSeconds) {
    if (epochSeconds == null) return '';
    final dt = DateTime.fromMillisecondsSinceEpoch((epochSeconds as int) * 1000);
    final months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${months[dt.month - 1]} ${dt.day}, ${dt.year}';
  }

  String _categoryEmoji(String? category) {
    switch (category) {
      case 'MUSIC': return '🎵';
      case 'SPORTS': return '⚽';
      case 'TECH': return '💻';
      case 'ART': return '🎨';
      case 'FOOD': return '🍔';
      default: return '📌';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Event Discover'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loadEvents,
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
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppTheme.error),
            const SizedBox(height: 16),
            Text(_error!),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _loadEvents, child: const Text('Retry')),
          ],
        ),
      );
    }

    if (_currentIndex >= _events.length) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.celebration_rounded, size: 64, color: AppTheme.primary),
            const SizedBox(height: 16),
            const Text(
              'No more events!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text('You\'ve seen everything for now.', style: TextStyle(color: AppTheme.textSecondary)),
            const SizedBox(height: 24),
            OutlinedButton(onPressed: _loadEvents, child: const Text('Refresh')),
          ],
        ),
      );
    }

    final event = _events[_currentIndex];

    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Center(
        child: Dismissible(
          key: Key(event['eventId'] as String),
          onDismissed: (direction) {
            if (direction == DismissDirection.endToStart) {
              // Swiped Left
              _nextCard();
            } else {
              // Swiped Right
              _handleSwipeRight(event);
            }
          },
          background: _swipeBackground(true),
          secondaryBackground: _swipeBackground(false),
          child: _buildTinderCard(event),
        ),
      ),
    );
  }

  Widget _swipeBackground(bool isRight) {
    return Container(
      alignment: isRight ? Alignment.centerLeft : Alignment.centerRight,
      padding: const EdgeInsets.symmetric(horizontal: 40),
      decoration: BoxDecoration(
        color: isRight ? AppTheme.primary.withValues(alpha: 0.2) : AppTheme.error.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Icon(
        isRight ? Icons.check_circle_rounded : Icons.cancel_rounded,
        color: isRight ? AppTheme.primary : AppTheme.error,
        size: 80,
      ),
    );
  }

  Widget _buildTinderCard(Map<String, dynamic> event) {
    final imageUrls = event['imageUrls'] as List<dynamic>?;
    final firstImage = (imageUrls != null && imageUrls.isNotEmpty) ? imageUrls.first as String : null;

    return Container(
      width: double.infinity,
      height: MediaQuery.of(context).size.height * 0.65,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Simulated "Image" area or actual event image
          Expanded(
            flex: 3,
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.05),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
              ),
              child: firstImage != null
                  ? ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
                      child: Image.network(
                        firstImage,
                        fit: BoxFit.cover,
                        width: double.infinity,
                      ),
                    )
                  : Center(
                      child: Text(
                        _categoryEmoji(event['category'] as String?),
                        style: const TextStyle(fontSize: 120),
                      ),
                    ),
            ),
          ),
          // Info Area
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          event['title'] as String? ?? '',
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        '${event['attendeeCount'] ?? 0} ppl',
                        style: const TextStyle(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.calendar_today_rounded, size: 16, color: AppTheme.textSecondary),
                      const SizedBox(width: 8),
                      Text(
                        _formatDate(event['startDate']),
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded, size: 16, color: AppTheme.textSecondary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          event['location'] as String? ?? 'No location',
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 16),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Text(
                    event['description'] as String? ?? 'No description provided.',
                    style: const TextStyle(color: AppTheme.textSecondary, height: 1.4),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
          // Actions visual indicators
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _circularAction(Icons.close, AppTheme.error, () => _nextCard()),
                _circularAction(Icons.favorite, AppTheme.primary, () => _handleSwipeRight(event)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _circularAction(IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: color.withValues(alpha: 0.2), width: 2),
        ),
        child: Icon(icon, color: color, size: 30),
      ),
    );
  }
}
