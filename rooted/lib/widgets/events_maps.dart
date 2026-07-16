import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import '../screens/event_detail_screen.dart';
import '../screens/user_profile_screen.dart';

class EventsMaps extends StatefulWidget {
  /// Optional server base URL for fetching events. If empty, sample events are used.
  final String server;
  /// Optional Google Maps API key used for geocoding when events don't include coords.
  final String? mapsApiKey;
  final String? categoryFilter;
  final String? searchQuery;

  const EventsMaps({
    super.key,
    this.server = '',
    this.mapsApiKey,
    this.categoryFilter,
    this.searchQuery,
  });

  @override
  State<EventsMaps> createState() => _EventsMapsState();
}

class _EventsMapsState extends State<EventsMaps> {
  GoogleMapController? _mapController;
  LatLng _center = const LatLng(38.7169, -9.1399);
  bool _loading = true;
  final Set<Marker> _markers = {};
  List<Map<String, dynamic>> _events = [];

  @override
  void initState() {
    super.initState();
    _init();
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(EventsMaps oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.categoryFilter != oldWidget.categoryFilter ||
        widget.searchQuery != oldWidget.searchQuery) {
      _fetchAndShowEvents();
    }
  }

  Future<void> _init() async {
    await _determinePosition();
    if (!mounted) return;
    await _fetchAndShowEvents();
    if (!mounted) return;
    setState(() => _loading = false);
    _moveCamera(_center, 12);
  }

  Future<void> _determinePosition() async {
    try {
      final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      if (!mounted) return;
      _center = LatLng(position.latitude, position.longitude);
    } catch (_) {
    }
  }

  Future<void> _fetchAndShowEvents() async {
    if (!mounted) return;
    setState(() {
      _loading = true;
      _markers.clear();
    });
    List<Map<String, dynamic>> events = [];

    if (widget.server.isEmpty) {
      // Use the live API instead of sample events
      try {
        final uri = Uri.parse('https://adc-final.ey.r.appspot.com/rest/events/list');
        final res = await http.post(
          uri, 
          headers: {'Content-Type': 'application/json'}, 
          body: json.encode({
            'input': {
              'status': 'UPCOMING', 
              'pageSize': 50,
              if (widget.categoryFilter != null) 'category': widget.categoryFilter,
            }
          })
        );
        if (res.statusCode == 200) {
          final data = json.decode(res.body);
          final d = data['data'];
          final eventsData = (d is Map ? d['events'] : null) as List? ?? data['events'] as List? ?? [];
          for (final e in eventsData) {
            if (e is Map) {
              final evMap = Map<String, dynamic>.from(e);
              // Client-side search filtering
              if (widget.searchQuery == null) {
                events.add(evMap);
              } else {
                final title = (evMap['title'] as String? ?? '').toLowerCase();
                final desc = (evMap['description'] as String? ?? '').toLowerCase();
                final organizer = (evMap['organizerUsername'] as String? ?? '').toLowerCase();
                final query = widget.searchQuery!.toLowerCase();
                if (title.contains(query) || desc.contains(query) || organizer.contains(query)) {
                  events.add(evMap);
                }
              }
            }
          }
        }
      } catch (_) {
        // Handle silently
      }
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
        if (!mounted) return;
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

    if (mounted) {
      setState(() {
        _events = events;
        _loading = false;
      });
    }
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
            const SizedBox(height: 4),
            GestureDetector(
              onTap: () {
                final organizer = ev['organizerUsername'];
                if (organizer != null) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => UserProfileScreen(username: organizer)),
                  );
                }
              },
              child: Text(
                'By ${ev['organizerUsername'] ?? 'Unknown'}',
                style: const TextStyle(color: Colors.blue, decoration: TextDecoration.underline),
              ),
            ),
            const SizedBox(height: 8),
            Text(ev['location']?.toString() ?? ''),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => EventDetailScreen(event: ev)),
                      );
                    },
                    child: const Text('View Details'),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close'),
                ),
              ],
            ),
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
        Flexible(
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
                            Text(
                              ev['title']?.toString() ?? 'Event',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              ev['location']?.toString() ?? '',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13),
                            ),
                            const Spacer(),
                            Text(
                              ev['attendees']?.toString() ??
                                  (ev['attendeesCount'] != null ? '${ev['attendeesCount']} attending' : 'No attendees info'),
                              style: const TextStyle(fontSize: 12),
                            ),
                            Text(
                              dist != null ? '${(dist / 1000).toStringAsFixed(1)} km' : 'Distance unknown',
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
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
