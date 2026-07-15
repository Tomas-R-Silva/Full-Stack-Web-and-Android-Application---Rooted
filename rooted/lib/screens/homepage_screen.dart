import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import '../widgets/filter_dialog.dart';
import '../widgets/full_screen_image.dart';
import '../widgets/sdg_badge.dart';
import 'event_detail_screen.dart';
import 'login_screen.dart';
import 'user_profile_screen.dart';

enum HomeViewType { feed, discover }

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
  HomeViewType _viewType = HomeViewType.feed;

  // Filtering
  String? _selectedCategory;
  List<int> _selectedSDGs = [];
  bool _selectedAccessible = false;

  // For Discover View (Tinder cards)
  int _discoverIndex = 0;

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
    if (!mounted) return;
    setState(() {
      _loading = true;
      _error = null;
      _discoverIndex = 0;
    });
    try {
      final result = await ApiService.listEvents(
        jwt: _jwt,
        status: 'UPCOMING',
        category: _selectedCategory?.toUpperCase(),
        sdg: _selectedSDGs.isEmpty ? null : _selectedSDGs,
        isAccessible: _selectedAccessible ? true : null,
        pageSize: 50,
      );
      final data   = result;
      final events = (data['events'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();

      // Client-side SDG Filtering (OR Logic)
      if (_selectedSDGs.isNotEmpty) {
        events.retainWhere((e) {
          final eventSDGs = (e['sdg'] as List<dynamic>? ?? [])
              .map((s) => (s as num).toInt())
              .toSet();
          return _selectedSDGs.any((s) => eventSDGs.contains(s));
        });
      }

      // Filter logic:
      if (_viewType == HomeViewType.feed) {
        // Feed: show everything upcoming, but filter out joined (except own)
        events.removeWhere((e) => e['_attending'] == true && e['organizerUsername'] != _username);
      } else {
        // Discover: hide joined AND own
        events.removeWhere((e) => e['organizerUsername'] == _username);
        events.removeWhere((e) => e['_attending'] == true);
      }

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

  Future<void> _handleSwipeRight(Map<String, dynamic> event) async {
    if (_jwt == null) {
      _showLoginPrompt();
      _nextDiscoverCard();
      return;
    }
    
    try {
      final eventId = event['eventId'] as String;
      await ApiService.attendEvent(jwt: _jwt!, eventId: eventId, username: _username);
      ApiService.notifyEventUpdate(eventId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Joined ${event['title']}!'),
            backgroundColor: AppTheme.primary,
            duration: const Duration(seconds: 1),
          ),
        );
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => EventDetailScreen(event: event)),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to join event'), backgroundColor: AppTheme.error),
        );
      }
    }
    _nextDiscoverCard();
  }

  void _nextDiscoverCard() {
    setState(() {
      _discoverIndex++;
    });
  }

  void _showLoginPrompt() {
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
  }

  Future<void> _toggleAttend(Map<String, dynamic> event) async {
    if (_jwt == null) {
      _showLoginPrompt();
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

  Future<void> _showFilterDialog() async {
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (_) => FilterDialog(
        initialCategory: _selectedCategory,
        initialSDGs: _selectedSDGs,
        initialAccessible: _selectedAccessible,
      ),
    );

    if (result != null) {
      setState(() {
        _selectedCategory = result['category'];
        _selectedSDGs = result['sdgs'];
        _selectedAccessible = result['accessible'] ?? false;
      });
      _loadEvents();
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

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          _buildTopBar(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _loadEvents,
              color: AppTheme.primary,
              child: _buildMainContent(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 8, 4),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 40,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  _tabItem('Feed', HomeViewType.feed),
                  _tabItem('Discover', HomeViewType.discover),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppTheme.primary, size: 22),
            onPressed: _loadEvents,
            visualDensity: VisualDensity.compact,
          ),
          IconButton(
            icon: Icon(
              Icons.filter_list_rounded,
              color: (_selectedCategory != null || _selectedSDGs.isNotEmpty || _selectedAccessible)
                  ? AppTheme.primary
                  : AppTheme.textSecondary,
              size: 22,
            ),
            onPressed: _showFilterDialog,
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }

  Widget _tabItem(String label, HomeViewType type) {
    final isSelected = _viewType == type;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          if (_viewType != type) {
            setState(() {
              _viewType = type;
              _loadEvents();
            });
          }
        },
        child: Container(
          margin: const EdgeInsets.all(2),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(18),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    )
                  ]
                : null,
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
              color: isSelected ? AppTheme.primary : AppTheme.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMainContent() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.6,
          child: _buildError(),
        ),
      );
    }
    if (_events.isEmpty) {
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.6,
          child: _buildEmpty(),
        ),
      );
    }

    if (_viewType == HomeViewType.feed) {
      return ListView.builder(
        padding: const EdgeInsets.only(bottom: 20),
        itemCount: _events.length,
        itemBuilder: (context, index) => _buildEventCard(_events[index]),
      );
    } else {
      // Must be scrollable for RefreshIndicator
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: SizedBox(
          height: MediaQuery.of(context).size.height * 0.7,
          child: _buildDiscoverView(),
        ),
      );
    }
  }

  Widget _buildDiscoverView() {
    if (_discoverIndex >= _events.length) {
      return _buildEmptyDiscover();
    }

    final event = _events[_discoverIndex];

    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Center(
        child: Dismissible(
          key: Key('discover_${event['eventId']}'),
          onDismissed: (direction) {
            if (direction == DismissDirection.endToStart) {
              _nextDiscoverCard();
            } else {
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
    final sdgs = event['sdg'] as List<dynamic>? ?? [];

    return Container(
      width: double.infinity,
      height: MediaQuery.of(context).size.height * 0.6,
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
                      child: GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => FullScreenImage(
                                imageUrls: imageUrls != null ? imageUrls.cast<String>() : [firstImage],
                                initialIndex: 0,
                                tagBase: 'event_image_${event['eventId']}',
                              ),
                            ),
                          );
                        },
                        child: Hero(
                          tag: 'event_image_${event['eventId']}_0',
                          child: Image.network(
                            firstImage,
                            fit: BoxFit.cover,
                            width: double.infinity,
                          ),
                        ),
                      ),
                    )
                  : Center(
                      child: Text(
                        _categoryEmoji(event['category'] as String?),
                        style: const TextStyle(fontSize: 100),
                      ),
                    ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          event['title'] as String? ?? '',
                          style: const TextStyle(
                            fontSize: 22,
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
                  _metaRow(Icons.calendar_today_rounded, _formatDate(event['startDate'])),
                  const SizedBox(height: 4),
                  _metaRow(Icons.location_on_rounded, event['location'] as String? ?? 'No location'),
                  if (sdgs.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    SdgChipRow(sdgs: sdgs, compact: true),
                  ],
                  const Spacer(),
                  Text(
                    event['description'] as String? ?? 'No description provided.',
                    style: const TextStyle(color: AppTheme.textSecondary, height: 1.3, fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _circularAction(Icons.close, AppTheme.error, () => _nextDiscoverCard()),
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
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: color.withValues(alpha: 0.2), width: 2),
        ),
        child: Icon(icon, color: color, size: 28),
      ),
    );
  }

  Widget _buildEmptyDiscover() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.celebration_rounded, size: 64, color: AppTheme.primary),
          const SizedBox(height: 16),
          const Text(
            'No more events to discover!',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text('Check back later for new ones.', style: TextStyle(color: AppTheme.textSecondary)),
          const SizedBox(height: 24),
          OutlinedButton(onPressed: _loadEvents, child: const Text('Refresh')),
        ],
      ),
    );
  }

  // ── Existing Card Components ─────────────────────────────────────────────

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
    final sdgs          = event['sdg'] as List<dynamic>? ?? [];

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
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    child: Hero(
                      tag: 'event_image_${event['eventId']}_0',
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
                    ),
                  ),
                  if (imageUrls != null && imageUrls.length > 1)
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.6),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.collections, color: Colors.white, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              '${imageUrls.length}',
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              )
            else
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
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _metaRow(Icons.calendar_today_outlined, _formatDate(startDate)),
                  const SizedBox(height: 4),
                  if (location.isNotEmpty)
                    _metaRow(Icons.location_on_outlined, location),
                  const SizedBox(height: 4),
                  _metaRow(
                    Icons.people_outline_rounded,
                    maxAttendees > 0
                        ? '$attendeeCount / $maxAttendees attending'
                        : '$attendeeCount attending',
                  ),
                  if (sdgs.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    SdgChipRow(sdgs: sdgs, compact: true),
                  ],
                  const SizedBox(height: 12),
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
                  if (!isOwn)
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => UserProfileScreen(username: event['organizerUsername']),
                          ),
                        );
                      },
                      child: Row(
                        children: [
                          const Icon(Icons.person_outline_rounded,
                              size: 14, color: AppTheme.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            event['organizerUsername'] ?? '',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w600,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ],
                      ),
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
