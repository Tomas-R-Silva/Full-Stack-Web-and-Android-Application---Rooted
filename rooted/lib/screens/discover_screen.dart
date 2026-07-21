import 'dart:async';

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
  static const Duration _holdInitialDelay = Duration(milliseconds: 400);
  static const Duration _holdRepeatInterval = Duration(milliseconds: 120);

  final Set<String> _selectedCategories = <String>{};
  final Set<int> _selectedSdgs = <int>{};
  int _selectedDistanceKm = 10;
  bool _locationAvailable = false;
  bool _nearYouEnabled = false;
  final TextEditingController _searchController = TextEditingController();

  Timer? _holdTimer;

  @override
  void dispose() {
    _searchController.dispose();
    _holdTimer?.cancel();
    super.dispose();
  }

  void _adjustDistance(int delta) {
    setState(() {
      _selectedDistanceKm = (_selectedDistanceKm + delta).clamp(_minDistanceKm, 1000000);
    });
  }

  void _startHold(int delta) {
    _holdTimer?.cancel();
    // Fire once immediately for a responsive tap-and-hold feel.
    _adjustDistance(delta);
    _holdTimer = Timer(_holdInitialDelay, () {
      _holdTimer = Timer.periodic(_holdRepeatInterval, (_) => _adjustDistance(delta));
    });
  }

  void _stopHold() {
    _holdTimer?.cancel();
    _holdTimer = null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Stack(
        children: [
          // Map fills the entire screen behind everything.
          Positioned.fill(
            child: EventsMaps(
              categoryFilters: _selectedCategories.isEmpty ? null : _selectedCategories.toList(),
              sdgFilters: _selectedSdgs.isEmpty ? null : _selectedSdgs.toList(),
              searchQuery: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
              maxDistanceKm: (_locationAvailable && _nearYouEnabled) ? _selectedDistanceKm.toDouble() : null,
              onLocationAvailabilityChanged: (available) {
                if (!mounted || available == _locationAvailable) return;
                setState(() {
                  _locationAvailable = available;
                  if (!available) {
                    _nearYouEnabled = false;
                  }
                });
              },
            ),
          ),

          // Filters float on top of the map.
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
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
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildNearYouToggle(),
                        if (_nearYouEnabled && _locationAvailable) ...[
                          const SizedBox(width: 12),
                          Expanded(child: _buildDistanceStepper()),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNearYouToggle() {
    return GestureDetector(
      onTap: _locationAvailable
          ? () {
              setState(() {
                _nearYouEnabled = !_nearYouEnabled;
              });
            }
          : null,
      child: Container(
        height: 54,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: _nearYouEnabled ? AppTheme.primary : AppTheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _nearYouEnabled ? AppTheme.primary : AppTheme.inputBorder,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.my_location,
              size: 18,
              color: _nearYouEnabled
                  ? Colors.white
                  : (_locationAvailable ? AppTheme.primary : AppTheme.textPrimary.withOpacity(0.4)),
            ),
            const SizedBox(width: 8),
            Text(
              'Near you',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: _nearYouEnabled
                    ? Colors.white
                    : (_locationAvailable ? AppTheme.textPrimary : AppTheme.textPrimary.withOpacity(0.4)),
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
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
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
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _buildStepperButton(
            icon: Icons.remove_circle_outline,
            enabled: _selectedDistanceKm > _minDistanceKm,
            delta: -_distanceStepKm,
          ),
          Expanded(
            child: Text(
              '$_selectedDistanceKm km',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w600),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          _buildStepperButton(
            icon: Icons.add_circle_outline,
            enabled: true,
            delta: _distanceStepKm,
          ),
        ],
      ),
    );
  }

  Widget _buildStepperButton({
    required IconData icon,
    required bool enabled,
    required int delta,
  }) {
    return GestureDetector(
      onLongPressStart: enabled ? (_) => _startHold(delta) : null,
      onLongPressEnd: enabled ? (_) => _stopHold() : null,
      onLongPressCancel: enabled ? _stopHold : null,
      child: IconButton(
        icon: Icon(icon),
        color: AppTheme.primary,
        onPressed: enabled ? () => _adjustDistance(delta) : null,
      ),
    );
  }
}