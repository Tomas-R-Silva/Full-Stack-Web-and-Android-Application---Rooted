import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'user_profile_screen.dart';

class ChatScreen extends StatefulWidget {
  final String friendUsername;

  const ChatScreen({super.key, required this.friendUsername});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  String? _jwt;
  String? _myUsername;

  final List<Map<String, dynamic>> _posts = [];
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _loadingMessages = true;
  bool _sendingMessage = false;
  Timer? _pollTimer;

  late String _conversationId;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    _jwt = await SessionStorage.getJwt();
    _myUsername = await SessionStorage.getUsername();

    // The conversation ID for private chats is the friend's username
    _conversationId = widget.friendUsername;

    await _loadMessages();
    // Poll for new messages every 5 seconds
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) => _pollMessages());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    if (_jwt == null || _myUsername == null) return;
    try {
      final result = await ApiService.listForumMessages(
        jwt: _jwt!,
        type: 'FRIEND',
        id: _conversationId,
        pageSize: 50,
        redirectOnError: false,
      );
      
      final posts = (result['posts'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();
          
      if (mounted) {
        setState(() {
          _posts
            ..clear()
            ..addAll(posts);
          _loadingMessages = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loadingMessages = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Chat Error: $e'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  Future<void> _pollMessages() async {
    if (_jwt == null || !mounted || _myUsername == null) return;
    try {
      final result = await ApiService.listForumMessages(
        jwt: _jwt!,
        type: 'FRIEND',
        id: _conversationId,
        pageSize: 50,
        redirectOnError: false,
      );
      
      final posts = (result['posts'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();
          
      if (!mounted) return;
      if (posts.length != _posts.length ||
          (posts.isNotEmpty &&
              posts.last['postId'] != (_posts.isNotEmpty ? _posts.last['postId'] : null))) {
        setState(() {
          _posts
            ..clear()
            ..addAll(posts);
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
        type: 'FRIEND',
        id: _conversationId,
        text: text,
        redirectOnError: false,
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

  String _formatDateShort(dynamic epochSeconds) {
    if (epochSeconds == null) return '';
    final dt =
        DateTime.fromMillisecondsSinceEpoch((epochSeconds as int) * 1000);
    return '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => UserProfileScreen(username: widget.friendUsername),
              ),
            );
          },
          child: Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: Colors.white.withOpacity(0.2),
                child: Text(
                  widget.friendUsername.isNotEmpty ? widget.friendUsername[0].toUpperCase() : '?',
                  style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  widget.friendUsername,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Expanded(child: _buildMessageList()),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildMessageList() {
    if (_loadingMessages) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_posts.isEmpty) {
      return Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.chat_bubble_outline, size: 48, color: Colors.grey),
              const SizedBox(height: 8),
              Text('No messages with ${widget.friendUsername} yet.\nSay hello!',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: AppTheme.textSecondary)),
            ],
          ),
        ),
      );
    }
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      itemCount: _posts.length,
      itemBuilder: (context, index) => _buildBubble(_posts[index]),
    );
  }

  Widget _buildBubble(Map<String, dynamic> post) {
    final isMe = post['authorUsername'] == _myUsername;

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isMe ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.surfaceContainerHighest,
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
            Text(
              post['text'] as String? ?? '',
              style: TextStyle(
                  color: isMe ? Theme.of(context).colorScheme.onPrimary : Theme.of(context).colorScheme.onSurface,
                  fontSize: 15),
            ),
            const SizedBox(height: 4),
            Text(
              _formatDateShort(post['createdAt']),
              style: TextStyle(
                  fontSize: 10,
                  color: isMe ? Theme.of(context).colorScheme.onPrimary.withOpacity(0.7) : Theme.of(context).colorScheme.onSurfaceVariant),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
    if (_myUsername == null) return const SizedBox.shrink();
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          border: Border(top: BorderSide(color: Theme.of(context).dividerColor)),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _messageController,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  hintText: 'Type a message…',
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surfaceContainerHighest,
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
}
