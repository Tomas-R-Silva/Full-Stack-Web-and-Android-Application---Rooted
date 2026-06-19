import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

class EventsMaps extends StatefulWidget {
  /// Optional server base URL for fetching events. If empty, sample events are used.
  final String server;
  /// Optional Google Maps API key used for geocoding when events don't include coords.
  final String? mapsApiKey;

  const EventsMaps({Key? key, this.server = '', this.mapsApiKey}) : super(key: key);

  @override
  State<EventsMaps> createState() => _EventsMapsState();
}

class _EventsMapsState extends State<EventsMaps> {
  GoogleMapController? _mapController;
  LatLng _center = const LatLng(0, 0);
  bool _loading = true;
  final Set<Marker> _markers = {};
  List<Map<String, dynamic>> _events = [];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    await _determinePosition();
    await _fetchAndShowEvents();
    setState(() => _loading = false);
    _moveCamera(_center, 12);
  }

  Future<void> _determinePosition() async {
    try {
      final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      _center = LatLng(position.latitude, position.longitude);
    } catch (_) {
      // fallback to IP-based lookup
      try {
        final res = await http.get(Uri.parse('https://ipapi.co/json/'));
        if (res.statusCode == 200) {
          final data = json.decode(res.body);
          if (data['latitude'] != null && data['longitude'] != null) {
            _center = LatLng((data['latitude'] as num).toDouble(), (data['longitude'] as num).toDouble());
          }
        }
      } catch (_) {
        // leave center at 0,0
      }
    }
  }

  Future<void> _fetchAndShowEvents() async {
    List<Map<String, dynamic>> events = [];

    if (widget.server.isEmpty) {
      // sample events when no server is configured
      events = [
        {
          'eventId': '1',
          'title': 'Rock Festival',
          'location': 'City Stadium',
          'attendees': '1.3k attending',
          'lat': _center.latitude + 0.01,
          'lng': _center.longitude + 0.01,
        },
        {
          'eventId': '2',
          'title': 'Startup Networking',
          'location': 'Innovation Hub',
          'attendees': '1.2k attending',
          'lat': _center.latitude - 0.01,
          'lng': _center.longitude - 0.01,
        },
      ];
    } else {
      try {
        final uri = Uri.parse('${widget.server.replaceAll(RegExp(r'/+\$'), '')}/events/list');
        final res = await http.post(uri, headers: {'Content-Type': 'application/json'}, body: json.encode({'status': 'UPCOMING'}));
        if (res.statusCode == 200) {
          final data = json.decode(res.body);
          final eventsData = data['events'] as List? ?? [];
          for (final e in eventsData) {
            if (e is Map) events.add(Map<String, dynamic>.from(e));
          }
        }
      } catch (e) {
        // fetch failed; continue with empty list
      }
    }

    // If events don't have coordinates, try geocoding (only if mapsApiKey supplied)
    for (int i = 0; i < events.length; i++) {
      final ev = events[i];
      double? lat = (ev['lat'] is num) ? (ev['lat'] as num).toDouble() : null;
      double? lng = (ev['lng'] is num) ? (ev['lng'] as num).toDouble() : null;

      if ((lat == null || lng == null) && widget.mapsApiKey != null && ev['location'] != null) {
        final coords = await _geocode(ev['location'].toString());
        if (coords != null) {
          lat = coords.latitude;
          lng = coords.longitude;
          ev['lat'] = lat;
          ev['lng'] = lng;
        }
      }

      if (lat != null && lng != null) {
        _addMarkerForEvent(ev, LatLng(lat, lng));
      }
    }

    setState(() => _events = events);
  }

  Future<LatLng?> _geocode(String address) async {
    if (widget.mapsApiKey == null) return null;
    try {
      final url = Uri.parse('https://maps.googleapis.com/maps/api/geocode/json?address=${Uri.encodeComponent(address)}&key=${widget.mapsApiKey}');
      final res = await http.get(url);
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final results = data['results'] as List?;
        if (results != null && results.isNotEmpty) {
          final loc = results[0]['geometry']['location'];
          return LatLng((loc['lat'] as num).toDouble(), (loc['lng'] as num).toDouble());
        }
      }
    } catch (_) {}
    return null;
  }

  void _addMarkerForEvent(Map<String, dynamic> ev, LatLng pos) {
    final id = ev['eventId']?.toString() ?? ev['id']?.toString() ?? UniqueKey().toString();
    final marker = Marker(
      markerId: MarkerId(id),
      position: pos,
      infoWindow: InfoWindow(title: ev['title']?.toString() ?? 'Event', snippet: ev['location']?.toString()),
      onTap: () => _onMarkerTap(ev, pos),
    );

    _markers.add(marker);
  }

  void _onMarkerTap(Map<String, dynamic> ev, LatLng pos) {
    showModalBottomSheet(
      context: context,
      builder: (_) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(ev['title']?.toString() ?? 'Event', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(ev['location']?.toString() ?? ''),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            )
          ],
        ),
      ),
    );
  }

  double _distanceMeters(LatLng a, LatLng b) {
    double toRad(double deg) => deg * pi / 180;
    final dLat = toRad(b.latitude - a.latitude);
    final dLng = toRad(b.longitude - a.longitude);
    final lat1 = toRad(a.latitude);
    final lat2 = toRad(b.latitude);
    final hav = sin(dLat / 2) * sin(dLat / 2) + sin(dLng / 2) * sin(dLng / 2) * cos(lat1) * cos(lat2);
    final c = 2 * atan2(sqrt(hav), sqrt(1 - hav));
    return 6371000 * c;
  }

  void _moveCamera(LatLng target, double zoom) {
    if (_mapController != null) {
      _mapController!.animateCamera(CameraUpdate.newCameraPosition(CameraPosition(target: target, zoom: zoom)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final nearest = List<Map<String, dynamic>>.from(_events);
    if (_center.latitude != 0 || _center.longitude != 0) {
      nearest.sort((a, b) {
        final aPos = (a['lat'] is num && a['lng'] is num) ? LatLng((a['lat'] as num).toDouble(), (a['lng'] as num).toDouble()) : null;
        final bPos = (b['lat'] is num && b['lng'] is num) ? LatLng((b['lat'] as num).toDouble(), (b['lng'] as num).toDouble()) : null;
        final ad = aPos == null ? double.infinity : _distanceMeters(_center, aPos);
        final bd = bPos == null ? double.infinity : _distanceMeters(_center, bPos);
        return ad.compareTo(bd);
      });
    }

    return Column(
      children: [
        SizedBox(
          height: 500,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: _loading
                ? Container(
                    color: Colors.grey.shade200,
                    child: const Center(child: CircularProgressIndicator()),
                  )
                : GoogleMap(
                    mapType: MapType.normal,
                    initialCameraPosition: CameraPosition(target: _center, zoom: 12),
                    markers: _markers,
                    myLocationEnabled: true,
                    myLocationButtonEnabled: true,
                    onMapCreated: (controller) => _mapController = controller,
                  ),
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 130,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: nearest.length,
            itemBuilder: (context, index) {
              final ev = nearest[index];
              final hasPos = ev['lat'] is num && ev['lng'] is num;
              final dist = hasPos ? _distanceMeters(_center, LatLng((ev['lat'] as num).toDouble(), (ev['lng'] as num).toDouble())) : null;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: SizedBox(
                  width: 240,
                  child: Card(
                    child: InkWell(
                      onTap: () {
                        if (hasPos) {
                          final pos = LatLng((ev['lat'] as num).toDouble(), (ev['lng'] as num).toDouble());
                          _moveCamera(pos, 14);
                        }
                      },
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(ev['title']?.toString() ?? 'Event', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16 )),
                            const SizedBox(height: 6),
                            Text(ev['location']?.toString() ?? ''),
                            const Spacer(),
                            Text(ev['attendees']?.toString() ?? (ev['attendeesCount'] != null ? '${ev['attendeesCount']} attending' : 'No attendees info')),
                            const Spacer(),
                            Text(dist != null ? '${(dist/1000).toStringAsFixed(1)} km' : 'Distance unknown', style: const TextStyle(fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
