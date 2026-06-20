import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;

class LocationAutocomplete extends StatefulWidget {
  final String apiKey;
  final ValueChanged<PlacePrediction>? onPlaceSelected;
  final String? Function(String?)? validator;

  const LocationAutocomplete({
    super.key,
    required this.apiKey,
    this.onPlaceSelected,
    this.validator,
  });

  @override
  State<LocationAutocomplete> createState() => _LocationAutocompleteState();
}

class PlacePrediction {
  final String placeId;
  final String description;

  PlacePrediction({required this.placeId, required this.description});
}

class _LocationAutocompleteState extends State<LocationAutocomplete> {
  final TextEditingController _controller = TextEditingController();
  final List<PlacePrediction> _predictions = [];
  bool _loading = false;
  LatLng? _biasLocation;

  @override
  void initState() {
    super.initState();
    _initBiasLocation();
  }

  Future<void> _initBiasLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      setState(() {
        _biasLocation = LatLng(position.latitude, position.longitude);
      });
    } catch (_) {
      try {
        final res = await http.get(Uri.parse('https://ipapi.co/json/'));
        if (res.statusCode == 200) {
          final data = json.decode(res.body);
          if (data['latitude'] != null && data['longitude'] != null) {
            _biasLocation = LatLng((data['latitude'] as num).toDouble(), (data['longitude'] as num).toDouble());
          }
        }
      } catch (_) {
        // Ignore errors and leave _biasLocation as null
      }
    }
  }

  Future<void> _search(String input) async {
    if (input.isEmpty) {
      setState(() => _predictions.clear());
      return;
    }

    setState(() => _loading = true);

    final locationParam = _biasLocation != null
        ? '&location=${_biasLocation!.latitude},${_biasLocation!.longitude}&radius=5000'
        : '';

    final url = Uri.parse(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json'
      '?input=${Uri.encodeComponent(input)}'
      '&types=geocode'
      '$locationParam'
      '&key=${widget.apiKey}',
    );

    final response = await http.get(url);
    final data = json.decode(response.body);

    setState(() {
      _loading = false;
      _predictions
        ..clear()
        ..addAll((data['predictions'] as List<dynamic>?)
                ?.map((item) => PlacePrediction(
                      placeId: item['place_id'] as String,
                      description: item['description'] as String,
                    ))
                .toList() ??
            []);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextFormField(
          controller: _controller,
          decoration: InputDecoration(
            labelText: 'Location',
            prefixIcon: const Icon(Icons.location_on),
            suffixIcon:
                _loading ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2)) : null,
            border: const OutlineInputBorder(),
          ),
          onChanged: _search,
          validator: widget.validator ??
              (value) =>
                  value == null || value.isEmpty ? 'Enter a location' : null,
        ),
        if (_predictions.isNotEmpty)
          Container(
            margin: const EdgeInsets.only(top: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 8)],
            ),
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: _predictions.length,
              itemBuilder: (context, index) {
                final item = _predictions[index];
                return ListTile(
                  title: Text(item.description),
                  onTap: () {
                    _controller.text = item.description;
                    setState(() => _predictions.clear());
                    widget.onPlaceSelected?.call(item);
                  },
                );
              },
            ),
          ),
      ],
    );
  }
}