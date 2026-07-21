import 'package:flutter/material.dart';

/// A blue verified checkmark icon that appears next to usernames
/// if the user has the 'PARTNER' role.
class PartnerMark extends StatelessWidget {
  final String? role;
  final double size;
  final bool showTooltip;

  const PartnerMark({
    super.key,
    required this.role,
    this.size = 18.0,
    this.showTooltip = true,
  });

  @override
  Widget build(BuildContext context) {
    if (role?.toUpperCase() != 'PARTNER') {
      return const SizedBox.shrink();
    }

    final badge = Icon(
      Icons.verified,
      color: Colors.blue.shade600,
      size: size,
    );

    if (!showTooltip) return badge;

    return Padding(
      padding: const EdgeInsets.only(left: 4.0),
      child: Tooltip(
        message: 'Verified Partner',
        child: badge,
      ),
    );
  }
}
