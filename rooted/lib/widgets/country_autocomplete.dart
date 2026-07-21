import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class CountryAutocomplete extends StatefulWidget {
  final String apiKey;
  final ValueChanged<String>? onCountrySelected;
  final TextEditingController? controller;

  const CountryAutocomplete({
    super.key,
    required this.apiKey,
    this.onCountrySelected,
    this.controller,
  });

  @override
  State<CountryAutocomplete> createState() => _CountryAutocompleteState();
}

class _CountryAutocompleteState extends State<CountryAutocomplete> {
  late final TextEditingController _controller =
      widget.controller ?? TextEditingController();
  final List<String> _predictions = [];
  bool _loading = false;

  Future<void> _search(String input) async {
    if (input.isEmpty) {
      setState(() => _predictions.clear());
      return;
    }

    setState(() => _loading = true);

    // types=country is not directly supported in the autocomplete URL types parameter,
    // but types=(regions) works well for administrative regions.
    // We then filter the results to only include those with 'country' in their types.
    final url = Uri.parse(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json'
      '?input=${Uri.encodeComponent(input)}'
      '&types=(regions)'
      '&key=${widget.apiKey}',
    );

    try {
      final response = await http.get(url);
      final data = json.decode(response.body);

      setState(() {
        _loading = false;
        _predictions
          ..clear()
          ..addAll((data['predictions'] as List<dynamic>?)
                  ?.where((item) => (item['types'] as List<dynamic>).contains('country'))
                  .map((item) => item['description'] as String)
                  .toList() ??
              []);
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: _controller,
          decoration: const InputDecoration(
            labelText: 'Country',
            prefixIcon: Icon(Icons.public_outlined, size: 20),
          ),
          onChanged: _search,
          validator: (v) => (v == null || v.trim().isEmpty) ? 'Country is required' : null,
        ),
        if (_loading)
          const Padding(
            padding: EdgeInsets.only(top: 8.0),
            child: SizedBox(
              height: 2,
              child: LinearProgressIndicator(),
            ),
          ),
        if (_predictions.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainer,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ListView.separated(
              padding: EdgeInsets.zero,
              shrinkWrap: true,
              itemCount: _predictions.length,
              separatorBuilder: (_, __) => Divider(height: 1, color: Theme.of(context).dividerColor.withOpacity(0.5)),
              itemBuilder: (context, index) {
                final country = _predictions[index];
                return ListTile(
                  dense: true,
                  title: Text(country, style: const TextStyle(fontSize: 14)),
                  onTap: () {
                    _controller.text = country;
                    setState(() => _predictions.clear());
                    widget.onCountrySelected?.call(country);
                    // Move cursor to end
                    _controller.selection = TextSelection.fromPosition(
                      TextPosition(offset: _controller.text.length),
                    );
                  },
                );
              },
            ),
          ),
      ],
    );
  }
}
