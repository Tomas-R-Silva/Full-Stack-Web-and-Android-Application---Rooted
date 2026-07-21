import 'package:flutter/material.dart';

class AccessibilityChip extends StatelessWidget {
  final bool compact;

  const AccessibilityChip({super.key, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final color = Colors.blue.shade700;
    final size = compact ? 22.0 : 30.0;

    return Tooltip(
      message: 'This event is accessible for people with reduced mobility',
      child: Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(compact ? 6 : 8),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.35),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Icon(
          Icons.accessible,
          color: Colors.white,
          size: compact ? 14 : 18,
        ),
      ),
    );
  }
}

class AccessibilityDetailRow extends StatelessWidget {
  const AccessibilityDetailRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          const AccessibilityChip(),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Accessible for people with reduced mobility',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
