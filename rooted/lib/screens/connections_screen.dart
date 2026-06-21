import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ConnectionsPage extends StatelessWidget {
  const ConnectionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Connections',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            TextField(
              decoration: InputDecoration(
                hintText: 'Search friends...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),

            const SizedBox(height: 24),

            const Text(
              'Friend Requests',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 12),

            _requestCard('Sarah Johnson'),
            _requestCard('Mike Roberts'),

            const SizedBox(height: 24),

            const Text(
              'Your Friends',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 12),

            _friendCard(
              name: 'Emma Wilson',
              subtitle: 'Online',
              online: true,
            ),

            _friendCard(
              name: 'Lucas Silva',
              subtitle: 'Last seen 10 min ago',
              online: false,
            ),

            _friendCard(
              name: 'Ana Costa',
              subtitle: 'Online',
              online: true,
            ),

            const SizedBox(height: 24),

            const Text(
              'Recent Chats',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 12),

            _chatTile(
              'Emma Wilson',
              'See you at the festival!',
            ),

            _chatTile(
              'Lucas Silva',
              'Are you joining the meetup?',
            ),
          ],
        ),
      ),
    );
  }

  Widget _requestCard(String name) {
    return Card(
      child: ListTile(
        leading: const CircleAvatar(
          child: Icon(Icons.person),
        ),
        title: Text(name),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(
                Icons.check,
                color: Colors.green,
              ),
              onPressed: () {},
            ),
            IconButton(
              icon: const Icon(
                Icons.close,
                color: Colors.red,
              ),
              onPressed: () {},
            ),
          ],
        ),
      ),
    );
  }

  Widget _friendCard({
    required String name,
    required String subtitle,
    required bool online,
  }) {
    return Card(
      child: ListTile(
        leading: Stack(
          children: [
            const CircleAvatar(
              child: Icon(Icons.person),
            ),
            if (online)
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.green,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.white),
                  ),
                ),
              ),
          ],
        ),
        title: Text(name),
        subtitle: Text(subtitle),
        trailing: IconButton(
          icon: const Icon(Icons.chat_bubble_outline),
          color: AppTheme.primary,
          onPressed: () {
            // Open chat
          },
        ),
      ),
    );
  }

  Widget _chatTile(String name, String lastMessage) {
    return Card(
      child: ListTile(
        leading: const CircleAvatar(
          child: Icon(Icons.person),
        ),
        title: Text(name),
        subtitle: Text(lastMessage),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}