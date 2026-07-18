import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../widgets/events_maps.dart';

class DiscoverPage extends StatefulWidget {
  const DiscoverPage({super.key});

  @override
  State<DiscoverPage> createState() => _DiscoverPageState();
}

class _DiscoverPageState extends State<DiscoverPage> {
  final List<String> _categoryOptions = [
    'Music',
    'Sports',
    'Tech',
    'Food',
    'Art',
    'Business',
    'Community',
    'Other',
  ];

  static const int _minDistanceKm = 5;
  static const int _distanceStepKm = 5;

  final Set<String> _selectedCategories = <String>{};
  final Set<int> _selectedSdgs = <int>{};
  int _selectedDistanceKm = 10;
  bool _locationAvailable = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        backgroundColor: AppTheme.background,
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text(
                'Discover Events',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: AppTheme.textPrimary),
              ),
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: _buildFilterDropdown<String>(
                      label: 'Category',
                      options: _categoryOptions,
                      selectedValues: _selectedCategories,
                      valueLabel: (value) => value,
                      onChanged: (values) {
                        setState(() {
                          _selectedCategories.clear();
                          _selectedCategories.addAll(values);
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildFilterDropdown<int>(
                      label: 'SDGs',
                      options: List.generate(17, (index) => index + 1),
                      selectedValues: _selectedSdgs,
                      valueLabel: (value) => 'SDG $value',
                      onChanged: (values) {
                        setState(() {
                          _selectedSdgs.clear();
                          _selectedSdgs.addAll(values);
                        });
                      },
                    ),
                  ),
                ],
              ),
            ),
            if (_locationAvailable) ...[
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _buildDistanceStepper(),
              ),
            ],
            const SizedBox(height: 12),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: EventsMaps(
                  categoryFilters: _selectedCategories.isEmpty ? null : _selectedCategories.toList(),
                  sdgFilters: _selectedSdgs.isEmpty ? null : _selectedSdgs.toList(),
                  searchQuery: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
                  maxDistanceKm: _locationAvailable ? _selectedDistanceKm.toDouble() : null,
                  onLocationAvailabilityChanged: (available) {
                    if (!mounted || available == _locationAvailable) return;
                    setState(() {
                      _locationAvailable = available;
                    });
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterDropdown<T>({
    required String label,
    required List<T> options,
    required Set<T> selectedValues,
    required String Function(T) valueLabel,
    required ValueChanged<Set<T>> onChanged,
  }) {
    final labelText = selectedValues.isEmpty
        ? label
        : selectedValues.length == 1
            ? valueLabel(selectedValues.first)
            : '${selectedValues.length} selected';

    return PopupMenuButton<T>(
      tooltip: label,
      offset: const Offset(0, 48),
      child: Container(
        height: 54,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.inputBorder),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                labelText,
                style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w600),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.arrow_drop_down, color: AppTheme.primary),
          ],
        ),
      ),
      itemBuilder: (context) => options
          .map(
            (option) => CheckedPopupMenuItem<T>(
              value: option,
              checked: selectedValues.contains(option),
              child: Text(valueLabel(option)),
            ),
          )
          .toList(),
      onSelected: (value) {
        final nextSelection = Set<T>.from(selectedValues);
        if (nextSelection.contains(value)) {
          nextSelection.remove(value);
        } else {
          nextSelection.add(value);
        }
        onChanged(nextSelection);
      },
    );
  }

  Widget _buildDistanceStepper() {
    return Container(
      height: 54,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.inputBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.remove_circle_outline),
            color: AppTheme.primary,
            onPressed: _selectedDistanceKm <= _minDistanceKm
                ? null
                : () {
                    setState(() {
                      _selectedDistanceKm =
                          (_selectedDistanceKm - _distanceStepKm).clamp(_minDistanceKm, 1000000);
                    });
                  },
          ),
          Expanded(
            child: Text(
              'Near you: $_selectedDistanceKm km',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w600),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            color: AppTheme.primary,
            onPressed: () {
              setState(() {
                _selectedDistanceKm += _distanceStepKm;
              });
            },
          ),
        ],
      ),
    );
  }
}