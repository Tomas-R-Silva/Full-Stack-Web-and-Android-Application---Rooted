import 'package:flutter/material.dart';

/// Official titles and brand colours for the 17 UN Sustainable Development
/// Goals, indexed 1-17 (same order used by create_screen/filter_dialog).
class SdgData {
  static const List<String> labels = [
    'No Poverty',
    'Zero Hunger',
    'Good Health & Well-Being',
    'Quality Education',
    'Gender Equality',
    'Clean Water & Sanitation',
    'Affordable & Clean Energy',
    'Decent Work & Economic Growth',
    'Industry, Innovation & Infrastructure',
    'Reduced Inequalities',
    'Sustainable Cities & Communities',
    'Responsible Consumption & Production',
    'Climate Action',
    'Life Below Water',
    'Life on Land',
    'Peace, Justice & Strong Institutions',
    'Partnerships for the Goals',
  ];

  // Official UN SDG colour palette.
  static const List<Color> colors = [
    Color(0xFFE5243B), // 1
    Color(0xFFDDA63A), // 2
    Color(0xFF4C9F38), // 3
    Color(0xFFC5192D), // 4
    Color(0xFFFF3A21), // 5
    Color(0xFF26BDE2), // 6
    Color(0xFFFCC30B), // 7
    Color(0xFFA21942), // 8
    Color(0xFFFD6925), // 9
    Color(0xFFDD1367), // 10
    Color(0xFFFD9D24), // 11
    Color(0xFFBF8B2E), // 12
    Color(0xFF3F7E44), // 13
    Color(0xFF0A97D9), // 14
    Color(0xFF56C02B), // 15
    Color(0xFF00689D), // 16
    Color(0xFF19486A), // 17
  ];

  static String labelFor(int n) => (n >= 1 && n <= 17) ? labels[n - 1] : 'SDG $n';
  static Color colorFor(int n) => (n >= 1 && n <= 17) ? colors[n - 1] : Colors.grey;

  /// Normalises a raw `event['sdg']` value (List<dynamic> of num) into a
  /// sorted list of valid goal numbers (1-17).
  static List<int> parse(dynamic raw) {
    if (raw is! List) return const [];
    final numbers = raw
        .whereType<num>()
        .map((n) => n.toInt())
        .where((n) => n >= 1 && n <= 17)
        .toSet()
        .toList();
    numbers.sort();
    return numbers;
  }
}

/// A single colour-coded SDG square, e.g. for goal 13 a green square
/// showing "13", with a tooltip revealing "Climate Action".
class SdgChip extends StatelessWidget {
  final int number;
  final bool compact;

  const SdgChip({super.key, required this.number, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final color = SdgData.colorFor(number);
    final size = compact ? 22.0 : 30.0;

    return Tooltip(
      message: 'SDG $number \u00b7 ${SdgData.labelFor(number)}',
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
        child: Text(
          '$number',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            fontSize: compact ? 11 : 13,
            height: 1,
          ),
        ),
      ),
    );
  }
}

/// A compact wrap of colour-coded [SdgChip]s — good for cards and other
/// space-constrained places. Each chip carries its own tooltip.
class SdgChipRow extends StatelessWidget {
  final dynamic sdgs;
  final bool compact;

  const SdgChipRow({super.key, required this.sdgs, this.compact = true});

  @override
  Widget build(BuildContext context) {
    final numbers = SdgData.parse(sdgs);
    if (numbers.isEmpty) return const SizedBox.shrink();

    return Wrap(
      spacing: compact ? 4 : 6,
      runSpacing: compact ? 4 : 6,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: numbers.map((n) => SdgChip(number: n, compact: compact)).toList(),
    );
  }
}

/// A fuller list used on the event detail screen: colour-coded square next
/// to the goal's full title, one per line.
class SdgDetailList extends StatelessWidget {
  final dynamic sdgs;

  const SdgDetailList({super.key, required this.sdgs});

  @override
  Widget build(BuildContext context) {
    final numbers = SdgData.parse(sdgs);
    if (numbers.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: numbers
          .map(
            (n) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  SdgChip(number: n),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      SdgData.labelFor(n),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}
