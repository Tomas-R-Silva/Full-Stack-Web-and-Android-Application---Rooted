import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/events_maps.dart';

class DiscoverPage extends StatelessWidget {
  const DiscoverPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Discover Events',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            TextField(
              decoration: InputDecoration(
                hintText: 'Search events, places, or people...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),

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
              runSpacing: 8,
              children: const [
                Chip(label: Text('🎵 Music')),
                Chip(label: Text('⚽ Sports')),
                Chip(label: Text('🎨 Art')),
                Chip(label: Text('💻 Tech')),
                Chip(label: Text('🍔 Food')),
                Chip(label: Text('🎭 Culture')),
              ],
            ),

            const SizedBox(height: 24),

            const Text(
              'Trending Near You',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),
            // Google Maps widget showing nearby events
            EventsMaps(
              // optionally provide server and mapsApiKey here
              server: '',
              mapsApiKey: null,
            ),

            const SizedBox(height: 24),

            const Text(
              'Recommended For You',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 12),

            _eventCard(
              title: 'Photography Walk',
              location: 'Historic Center',
              attendees: '89 attending',
              icon: Icons.camera_alt,
            ),

            _eventCard(
              title: 'AI & Tech Meetup',
              location: 'Tech Center',
              attendees: '143 attending',
              icon: Icons.memory,
            ),
          ],
        ),
      ),
    );
  }

  Widget _eventCard({
    required String title,
    required String location,
    required String attendees,
    required IconData icon,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: AppTheme.primary.withOpacity(0.15),
          child: Icon(
            icon,
            color: AppTheme.primary,
          ),
        ),
        title: Text(title),
        subtitle: Text(location),
        trailing: Text(
          attendees,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}