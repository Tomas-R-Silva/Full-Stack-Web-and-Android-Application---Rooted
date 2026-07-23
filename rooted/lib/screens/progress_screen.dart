import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/impact_section.dart';
import '../widgets/avatar_with_border.dart';

class ProgressScreen extends StatelessWidget {
  final String username;
  final String displayName;
  final String? avatarUrl;
  final String? borderId;
  final int points;
  final List<int> ods;

  const ProgressScreen({
    super.key,
    required this.username,
    required this.displayName,
    this.avatarUrl,
    this.borderId,
    required this.points,
    required this.ods,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Progress & Impact'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // User Header
            Center(
              child: Column(
                children: [
                  AvatarWithBorder(
                    borderId: borderId,
                    imageUrl: avatarUrl,
                    radius: 50,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    displayName,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '@$username',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 32),
            const Divider(),
            const SizedBox(height: 32),

            ImpactSection(
              points: points,
              ods: ods,
            ),
            
            const SizedBox(height: 40),
            
            // Information Footer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainer,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Theme.of(context).dividerColor),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Theme.of(context).colorScheme.primary),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Your progress is tracked through participation in SDG-related events. Each goal reached helps contribute to a sustainable future!',
                      style: TextStyle(fontSize: 13),
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
}
