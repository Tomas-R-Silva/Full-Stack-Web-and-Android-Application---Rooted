import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '👋 Hey, John',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            const Text(
              'Discover experiences around you',
              style: TextStyle(fontSize: 16),
            ),

            const SizedBox(height: 16),

            TextField(
              decoration: InputDecoration(
                hintText: 'Search events...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),

            const SizedBox(height: 20),

            _featuredCard(),

            const SizedBox(height: 20),

            const Text(
              'Categories',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 10),

            Wrap(
              spacing: 8,
              children: const [
                Chip(label: Text('🎵 Music')),
                Chip(label: Text('⚽ Sports')),
                Chip(label: Text('🎨 Art')),
                Chip(label: Text('💻 Tech')),
                Chip(label: Text('🍔 Food')),
                Chip(label: Text('🎭 Culture')),
              ],
            ),

            const SizedBox(height: 20),

            const Text(
              'Events Near You',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 10),

            _eventCard(
              'Tech Meetup 2026',
              '2.3 km away',
              '143 attending',
            ),

            _eventCard(
              'Summer Music Festival',
              '4.1 km away',
              '532 attending',
            ),

            const SizedBox(height: 20),

            const Text(
              'People You May Meet',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 10),

            _personTile(
              'Sarah',
              'Loves hiking & music',
            ),

            _personTile(
              'Mike',
              'Startup founder',
            ),

            _personTile(
              'Emma',
              'Photography enthusiast',
            ),
          ],
        ),
      ),
    );
  }

  Widget _featuredCard() => Container(
    height: 180,
    padding: const EdgeInsets.all(20),
    decoration: BoxDecoration(
      color: AppTheme.primary,
      borderRadius: BorderRadius.circular(20),
    ),
    child: const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Text(
          '🎵 Summer Music Festival',
          style: TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 8),
        Text(
          '📍 City Park • June 24 • 7:00 PM',
          style: TextStyle(color: Colors.white70),
        ),
      ],
    ),
  );

  Widget _eventCard(
      String title,
      String distance,
      String attendees,
      ) =>
      Card(
        child: ListTile(
          leading: const CircleAvatar(
            child: Icon(Icons.event),
          ),
          title: Text(title),
          subtitle: Text(distance),
          trailing: Text(attendees),
        ),
      );

  Widget _personTile(
      String name,
      String bio,
      ) =>
      Card(
        child: ListTile(
          leading: const CircleAvatar(
            child: Icon(Icons.person),
          ),
          title: Text(name),
          subtitle: Text(bio),
        ),
      );
}