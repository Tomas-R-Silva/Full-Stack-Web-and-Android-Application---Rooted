import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class FilterDialog extends StatefulWidget {
  final String? initialCategory;
  final List<int> initialSDGs;

  const FilterDialog({
    super.key,
    this.initialCategory,
    required this.initialSDGs,
  });

  @override
  State<FilterDialog> createState() => _FilterDialogState();
}

class _FilterDialogState extends State<FilterDialog> {
  String? _selectedCategory;
  late List<int> _selectedSDGs;

  final List<String> _categories = [
    'All',
    'Music',
    'Sports',
    'Tech',
    'Food',
    'Art',
    'Business',
    'Community',
    'Other',
  ];

  final List<String> _sdgLabels = [
    'No Poverty', 'Zero Hunger', 'Good Health', 'Quality Education',
    'Gender Equality', 'Clean Water', 'Affordable Energy', 'Decent Work',
    'Industry & Innovation', 'Reduced Inequalities', 'Sustainable Cities',
    'Responsible Consumption', 'Climate Action', 'Life Below Water',
    'Life on Land', 'Peace & Justice', 'Partnerships'
  ];

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'All';
    _selectedSDGs = List.from(widget.initialSDGs);
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Filter Events'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Category',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedCategory,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              items: _categories
                  .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                  .toList(),
              onChanged: (val) => setState(() => _selectedCategory = val),
            ),
            const SizedBox(height: 20),
            const Text(
              'Sustainability Goals (SDGs)',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: List.generate(17, (index) {
                final sdgNum = index + 1;
                final isSelected = _selectedSDGs.contains(sdgNum);
                return FilterChip(
                  label: Text('SDG $sdgNum'),
                  tooltip: _sdgLabels[index],
                  selected: isSelected,
                  onSelected: (val) {
                    setState(() {
                      if (val) {
                        _selectedSDGs.add(sdgNum);
                      } else {
                        _selectedSDGs.remove(sdgNum);
                      }
                    });
                  },
                  selectedColor: AppTheme.primary.withValues(alpha: 0.2),
                  checkmarkColor: AppTheme.primary,
                );
              }),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primary,
            foregroundColor: Colors.white,
          ),
          onPressed: () {
            Navigator.pop(context, {
              'category': _selectedCategory == 'All' ? null : _selectedCategory,
              'sdgs': _selectedSDGs,
            });
          },
          child: const Text('Apply'),
        ),
      ],
    );
  }
}
