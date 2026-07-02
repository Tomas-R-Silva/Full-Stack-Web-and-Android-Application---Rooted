import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';

class EventDetailScreen extends StatefulWidget {
  final Map<String, dynamic> event;

  const EventDetailScreen({super.key, required this.event});

  @override
  State<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends State<EventDetailScreen> {
  String? _jwt;
  String? _username;

  final List<Map<String, dynamic>> _posts = [];
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _loadingMessages = true;
  bool _sendingMessage = false;
  String? _nextCursor;
  Timer? _pollTimer;

  late Map<String, dynamic> _event;

  @override
  void initState() {
    super.initState();
    _event = Map<String, dynamic>.from(widget.event);
    _init();
  }

  Future<void> _init() async {
    _jwt = await SessionStorage.getJwt();
    _username = await SessionStorage.getUsername();
    
    // Refresh event data to ensure attendance status is current
    await _refreshEventData();
    
    await _loadMessages();
    // Poll for new messages every 5 seconds
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) => _pollMessages());
  }

  Future<void> _refreshEventData() async {
    try {
      final result = await ApiService.getEvent(
        eventId: _event['eventId'] as String,
        jwt: _jwt,
      );
      final eventData = result['data']?['event'] ?? result['event'] ?? result;
      if (mounted) {
        setState(() {
          _event = Map<String, dynamic>.from(eventData);
        });
      }
    } catch (e) {
      // Silently fail if refresh fails
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    if (_jwt == null) return;
    try {
      final result = await ApiService.listForumMessages(
        jwt: _jwt!,
        eventId: _event['eventId'] as String,
        pageSize: 50,
      );
      final data  = result['data'] ?? {};
      final posts = (data['posts'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();
      if (mounted) {
        setState(() {
          _posts
            ..clear()
            ..addAll(posts);
          _nextCursor = result['nextCursor'] as String?;
          _loadingMessages = false;
        });
        _scrollToBottom();
      }
    } catch (_) {
      if (mounted) setState(() => _loadingMessages = false);
    }
  }

  /// Polls silently — only updates if there are genuinely new posts.
  Future<void> _pollMessages() async {
    if (_jwt == null || !mounted) return;
    try {
      final result = await ApiService.listForumMessages(
        jwt: _jwt!,
        eventId: _event['eventId'] as String,
        pageSize: 50,
      );
      final data  = result['data'] ?? {};
      final posts = (data['posts'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();
      if (!mounted) return;
      if (posts.length != _posts.length ||
          (posts.isNotEmpty &&
              posts.last['postId'] != _posts.last['postId'])) {
        setState(() {
          _posts
            ..clear()
            ..addAll(posts);
          _nextCursor = result['nextCursor'] as String?;
        });
        _scrollToBottom();
      }
    } catch (_) {
      // Silently ignore poll errors
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _jwt == null) return;

    setState(() => _sendingMessage = true);
    _messageController.clear();

    try {
      final post = await ApiService.postForumMessage(
        jwt: _jwt!,
        eventId: _event['eventId'] as String,
        text: text,
      );
      if (mounted) {
        final data = post['data'] ?? post;
        setState(() {
          _posts.add(data);
          _sendingMessage = false;
        });
        _scrollToBottom();
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _sendingMessage = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppTheme.error),
        );
      }
    } catch (_) {
      if (mounted) setState(() => _sendingMessage = false);
    }
  }

  Future<void> _deletePost(Map<String, dynamic> post) async {
    if (_jwt == null) return;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete message?'),
        content: const Text('This cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Delete',
                  style: TextStyle(color: AppTheme.error))),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await ApiService.deleteForumPost(
          jwt: _jwt!, postId: post['postId'] as String);
      if (mounted) {
        setState(() => _posts.removeWhere(
            (p) => p['postId'] == post['postId']));
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppTheme.error),
        );
      }
    }
  }

  bool _canDelete(Map<String, dynamic> post) {
    return post['authorUsername'] == _username ||
        _event['organizerUsername'] == _username;
  }

  String _formatDate(dynamic epochSeconds) {
    if (epochSeconds == null) return '';
    final dt =
        DateTime.fromMillisecondsSinceEpoch((epochSeconds as int) * 1000);
    return '${dt.day.toString().padLeft(2, '0')}/'
        '${dt.month.toString().padLeft(2, '0')}/'
        '${dt.year}  '
        '${dt.hour.toString().padLeft(2, '0')}:'
        '${dt.minute.toString().padLeft(2, '0')}';
  }

  String _formatDateShort(dynamic epochSeconds) {
    if (epochSeconds == null) return '';
    final dt =
        DateTime.fromMillisecondsSinceEpoch((epochSeconds as int) * 1000);
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'UPCOMING':
        return Colors.blue;
      case 'COMPLETED':
        return Colors.green;
      case 'CANCELLED':
        return AppTheme.error;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isClosed = _event['status'] == 'CANCELLED' ||
        _event['status'] == 'COMPLETED';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          _event['title'] as String? ?? 'Event',
          overflow: TextOverflow.ellipsis,
        ),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          _buildEventInfo(),
          const Divider(height: 1),

          Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.forum_outlined, size: 18,
                    color: AppTheme.textSecondary),
                const SizedBox(width: 6),
                const Text('Event Chat',
                    style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textSecondary)),
                const Spacer(),
                if (_loadingMessages)
                  const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2)),
              ],
            ),
          ),
          const Divider(height: 1),

          Expanded(child: _buildMessageList()),

          if (!isClosed) _buildMessageInput(),
          if (isClosed) _buildClosedBanner(),
        ],
      ),
    );
  }

  Widget _buildEventInfo() {
    final imageUrls = _event['imageUrls'] as List<dynamic>?;
    final firstImage = (imageUrls != null && imageUrls.isNotEmpty) ? imageUrls.first as String : null;

    return Container(
      width: double.infinity,
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (firstImage != null)
            Image.network(
              firstImage,
              height: 200,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status badge
                Row(
                  children: [
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: _statusColor(_event['status'] as String?)
                            .withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _event['status'] as String? ?? '',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: _statusColor(_event['status'] as String?),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _event['category'] as String? ?? '',
                        style: const TextStyle(
                            fontSize: 11, color: AppTheme.textSecondary),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  _event['title'] as String? ?? '',
                  style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary),
                ),
                const SizedBox(height: 10),
                _infoRow(Icons.person_outline_rounded,
                    'Organised by ${_event['organizerUsername'] ?? ''}'),
                _infoRow(Icons.calendar_today_outlined,
                    _formatDate(_event['startDate'])),
                _infoRow(Icons.location_on_outlined,
                    _event['location'] as String? ?? ''),
                _infoRow(Icons.timer_outlined,
                    '${_event['durationMinutes'] ?? 0} minutes'),
                _infoRow(Icons.people_outline,
                    '${_event['attendeeCount'] ?? 0} / ${_event['maxAttendees'] ?? '∞'} attendees'),
                if ((_event['description'] as String? ?? '').isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    _event['description'] as String,
                    style: const TextStyle(
                        fontSize: 13, color: AppTheme.textSecondary, height: 1.5),
                  ),
                ],
                const SizedBox(height: 16),
                if (_event['organizerUsername'] != _username)
                  SizedBox(
                    width: double.infinity,
                    child: _buildJoinButton(),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJoinButton() {
    final isAttending = _event['_attending'] == true;
    final attendeeCount = _event['attendeeCount'] as int? ?? 0;
    final maxAttendees = _event['maxAttendees'] as int? ?? 0;
    final isFull = maxAttendees > 0 && attendeeCount >= maxAttendees;

    if (isAttending) {
      return OutlinedButton.icon(
        onPressed: _toggleAttend,
        icon: const Icon(Icons.check_circle_outline_rounded, size: 16),
        label: const Text('Joined'),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppTheme.primary,
          side: const BorderSide(color: AppTheme.primary),
          textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        ),
      );
    }

    if (isFull) {
      return OutlinedButton(
        onPressed: null,
        child: const Text('Event full'),
      );
    }

    return ElevatedButton.icon(
      onPressed: _toggleAttend,
      icon: const Icon(Icons.add_rounded, size: 16),
      label: const Text('Join Event'),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        elevation: 0,
      ),
    );
  }

  Future<void> _toggleAttend() async {
    if (_jwt == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login to join events')),
      );
      return;
    }

    final eventId = _event['eventId'] as String;
    final isAttending = _event['_attending'] == true;

    try {
      if (isAttending) {
        await ApiService.unattendEvent(jwt: _jwt!, eventId: eventId);
        setState(() {
          _event['_attending'] = false;
          final count = (_event['attendeeCount'] as int? ?? 1) - 1;
          _event['attendeeCount'] = count < 0 ? 0 : count;
        });
      } else {
        await ApiService.attendEvent(jwt: _jwt!, eventId: eventId);
        ApiService.notifyEventUpdate(eventId);
        setState(() {
          _event['_attending'] = true;
          _event['attendeeCount'] = (_event['attendeeCount'] as int? ?? 0) + 1;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e is ApiException ? e.message : 'An error occurred'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  Widget _infoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppTheme.textSecondary),
          const SizedBox(width: 6),
          Expanded(
            child: Text(text,
                style: const TextStyle(
                    fontSize: 13, color: AppTheme.textSecondary)),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageList() {
    if (_loadingMessages) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_posts.isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.chat_bubble_outline, size: 48, color: Colors.grey),
            SizedBox(height: 8),
            Text('No messages yet.\nBe the first to say something!',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppTheme.textSecondary)),
          ],
        ),
      );
    }
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      itemCount: _posts.length,
      itemBuilder: (context, index) => _buildBubble(_posts[index]),
    );
  }

  Widget _buildBubble(Map<String, dynamic> post) {
    final isMe = post['authorUsername'] == _username;
    final canDel = _canDelete(post);

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: GestureDetector(
        onLongPress: canDel ? () => _deletePost(post) : null,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 3),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.72,
          ),
          decoration: BoxDecoration(
            color: isMe ? AppTheme.primary : Colors.grey.shade100,
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(16),
              topRight: const Radius.circular(16),
              bottomLeft: Radius.circular(isMe ? 16 : 4),
              bottomRight: Radius.circular(isMe ? 4 : 16),
            ),
          ),
          child: Column(
            crossAxisAlignment:
                isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              if (!isMe)
                Text(
                  post['authorUsername'] as String? ?? '',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isMe ? Colors.white70 : AppTheme.primary,
                  ),
                ),
              Text(
                post['text'] as String? ?? '',
                style: TextStyle(
                    color: isMe ? Colors.white : AppTheme.textPrimary,
                    fontSize: 14),
              ),
              const SizedBox(height: 2),
              Text(
                _formatDateShort(post['createdAt']),
                style: TextStyle(
                    fontSize: 10,
                    color: isMe ? Colors.white54 : Colors.grey.shade500),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade200)),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _messageController,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: 'Message…',
                  filled: true,
                  fillColor: Colors.grey.shade100,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
            const SizedBox(width: 8),
            CircleAvatar(
              backgroundColor: AppTheme.primary,
              child: _sendingMessage
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : IconButton(
                      icon: const Icon(Icons.send_rounded,
                          color: Colors.white, size: 18),
                      onPressed: _sendMessage,
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildClosedBanner() {
    return SafeArea(
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        color: Colors.grey.shade100,
        child: Text(
          _event['status'] == 'CANCELLED'
              ? 'This event was cancelled. The chat is now read-only.'
              : 'This event has ended. The chat is now read-only.',
          textAlign: TextAlign.center,
          style:
              const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
        ),
      ),
    );
  }
}
