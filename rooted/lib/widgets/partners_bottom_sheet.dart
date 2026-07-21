import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import 'partner_mark.dart';

class PartnersBottomSheet extends StatefulWidget {
  final Map<String, dynamic> event;
  final String jwt;
  final VoidCallback onUpdate;

  const PartnersBottomSheet({
    super.key,
    required this.event,
    required this.jwt,
    required this.onUpdate,
  });

  @override
  State<PartnersBottomSheet> createState() => _PartnersBottomSheetState();
}

class _PartnersBottomSheetState extends State<PartnersBottomSheet> {
  final TextEditingController _usernameController = TextEditingController();
  bool _isAdding = false;
  bool _isRemoving = false;
  String? _processingUsername;

  List<String> get _partners {
    final p = widget.event['partners'];
    if (p is List) {
      return p.map((e) => e.toString()).toList();
    }
    return [];
  }

  @override
  void dispose() {
    _usernameController.dispose();
    super.dispose();
  }

  Future<void> _addPartner() async {
    final username = _usernameController.text.trim();
    if (username.isEmpty) return;

    setState(() => _isAdding = true);
    try {
      await ApiService.addPartner(
        jwt: widget.jwt,
        eventId: widget.event['eventId'] as String,
        username: username,
      );
      _usernameController.clear();
      widget.onUpdate();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Added $username as partner')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to add partner: $e'), backgroundColor: AppTheme.error),
        );
      }
    } finally {
      if (mounted) setState(() => _isAdding = false);
    }
  }

  Future<void> _removePartner(String username) async {
    setState(() {
      _isRemoving = true;
      _processingUsername = username;
    });
    try {
      await ApiService.removePartner(
        jwt: widget.jwt,
        eventId: widget.event['eventId'] as String,
        username: username,
      );
      widget.onUpdate();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Removed $username from partners')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to remove partner: $e'), backgroundColor: AppTheme.error),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isRemoving = false;
          _processingUsername = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final partners = _partners;

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.8,
        ),
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.onSurface.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Text(
              'Manage Partners',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Invite other users to co-organize this event.',
              style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _usernameController,
                    decoration: InputDecoration(
                      hintText: 'Enter username...',
                      filled: true,
                      fillColor: Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.5),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onSubmitted: (_) => _addPartner(),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: _isAdding ? null : _addPartner,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  ),
                  child: _isAdding
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Add'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Text(
              'Current Partners',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            Flexible(
              child: partners.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: Text(
                          'No partners added yet.',
                          style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
                        ),
                      ),
                    )
                  : ListView.separated(
                      shrinkWrap: true,
                      itemCount: partners.length,
                      separatorBuilder: (_, __) => const Divider(),
                      itemBuilder: (context, index) {
                        final username = partners[index];
                        final isProcessing = _isRemoving && _processingUsername == username;

                        return ListTile(
                          contentPadding: EdgeInsets.zero,
                          leading: CircleAvatar(
                            backgroundColor: AppTheme.primary.withOpacity(0.1),
                            child: Text(
                              username.isNotEmpty ? username[0].toUpperCase() : '?',
                              style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold),
                            ),
                          ),
                          title: Text(username, style: const TextStyle(fontWeight: FontWeight.w600)),
                          trailing: isProcessing
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                              : IconButton(
                                  icon: const Icon(Icons.remove_circle_outline, color: AppTheme.error),
                                  onPressed: () => _removePartner(username),
                                ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
