import 'package:flutter/material.dart';
import 'sdg_badge.dart';

class ImpactSection extends StatelessWidget {
  final int points;
  final List<int> ods;

  const ImpactSection({
    super.key,
    required this.points,
    required this.ods,
  });

  @override
  Widget build(BuildContext context) {
    final totalSdgEvents = ods.fold<int>(0, (sum, count) => sum + count);
    final uniqueSdgs = ods.where((count) => count > 0).length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Your Impact',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '$points Points',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            _buildStatCard(
              context,
              'SDG Events',
              totalSdgEvents.toString(),
              Icons.eco_outlined,
            ),
            const SizedBox(width: 12),
            _buildStatCard(
              context,
              'Goals Met',
              '$uniqueSdgs / 17',
              Icons.flag_outlined,
            ),
          ],
        ),
        const SizedBox(height: 20),
        const Text(
          'Detailed Progress',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 0.85,
          ),
          itemCount: 17,
          itemBuilder: (context, index) {
            final sdgNum = index + 1;
            final count = ods[index];
            return _buildSdgProgressItem(context, sdgNum, count);
          },
        ),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainer,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Theme.of(context).dividerColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSdgProgressItem(BuildContext context, int sdgNum, int count) {
    final milestone = 10;
    final progress = (count / milestone).clamp(0.0, 1.0);
    final isUnlocked = count >= milestone;

    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainer,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isUnlocked 
            ? SdgData.colorFor(sdgNum).withOpacity(0.5)
            : Theme.of(context).dividerColor,
          width: isUnlocked ? 2 : 1,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SdgChip(number: sdgNum, compact: true),
          const SizedBox(height: 8),
          Text(
            '$count / $milestone',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isUnlocked ? SdgData.colorFor(sdgNum) : null,
            ),
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Theme.of(context).colorScheme.outlineVariant,
              color: SdgData.colorFor(sdgNum),
              minHeight: 4,
            ),
          ),
        ],
      ),
    );
  }
}
