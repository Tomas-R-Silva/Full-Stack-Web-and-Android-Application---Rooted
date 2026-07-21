import 'dart:math';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:rooted/screens/event_detail_screen.dart';
import 'package:http/http.dart' as http;

import '../services/api_service.dart';
import '../theme/app_theme.dart';

class EventsMaps extends StatefulWidget {
  final String mapsApiKey = dotenv.env['MAPS_API_KEY'] ?? '';
  final List<String>? categoryFilters;
  final List<int>? sdgFilters;
  final String? searchQuery;
  final double? maxDistanceKm;
  final ValueChanged<bool>? onLocationAvailabilityChanged;

  EventsMaps({
    super.key,
    this.categoryFilters,
    this.sdgFilters,
    this.searchQuery,
    this.maxDistanceKm,
    this.onLocationAvailabilityChanged,
  });

  @override
  State<EventsMaps> createState() => _EventsMapsState();
}

class _EventsMapsState extends State<EventsMaps> {
  GoogleMapController? _mapController;
  LatLng _center = const LatLng(0.0, 0.0);
  double _zoom = 1.0;
  bool _loading = true;
  bool _hasLocation = false;
  Set<Marker> _markers = {};
  List<Map<String, dynamic>> _rawEvents = [];
  List<Map<String, dynamic>> _events = [];
  final Map<String, LatLng> _geocodeCache = {};

  @override
  void initState() {
    super.initState();
    _init();
  }

  @override
  void didUpdateWidget(EventsMaps oldWidget) {
    super.didUpdateWidget(oldWidget);
    final filtersChanged = !listEquals(widget.categoryFilters, oldWidget.categoryFilters) ||
        !listEquals(widget.sdgFilters, oldWidget.sdgFilters) ||
        widget.searchQuery != oldWidget.searchQuery ||
        widget.maxDistanceKm != oldWidget.maxDistanceKm;

    if (filtersChanged) {
      _applyFilters();
    }
  }

  Future<void> _init() async {
    await Future.wait([
      _determinePosition().timeout(
        const Duration(seconds: 12),
        onTimeout: () {}, // give up on location silently, map still loads
      ),
      _fetchEvents(),
    ]);

    widget.onLocationAvailabilityChanged?.call(_hasLocation);

    if (mounted) {
      setState(() => _loading = false);
    }
  }

  Future<void> _determinePosition() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission != LocationPermission.whileInUse && permission != LocationPermission.always) {
        return;
      }

      Position? position;

      try {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        ).timeout(const Duration(seconds: 5));
      } catch (_) {
        // High-accuracy fix failed or timed out; fall back gracefully.
        position = await Geolocator.getLastKnownPosition();

        if (position == null) {
          try {
            position = await Geolocator.getCurrentPosition(
              desiredAccuracy: LocationAccuracy.medium,
            ).timeout(const Duration(seconds: 5));
          } catch (_) {
            position = null; // give up cleanly instead of hanging
          }
        }
      }

      if (mounted && position != null) {
        _center = LatLng(position.latitude, position.longitude);
        _zoom = 14.0;
        _hasLocation = true;
      }
    } catch (_) {
      // Any unexpected error (permission denial, plugin error, etc.) — just
      // proceed without location rather than blocking map load.
    }
  }

  /// Hits the network once and stores the unfiltered event list.
  Future<void> _fetchEvents() async {
    if (!mounted) return;

    List<Map<String, dynamic>> events = [];

    try {
      final result = await ApiService.listEvents(
        status: 'UPCOMING',
        pageSize: 100,
      );
      final eventsData = (result['events'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();
      events = eventsData.map((event) => Map<String, dynamic>.from(event)).toList();
    } catch (e) {
      debugPrint('EventsMaps: failed to fetch events: $e');
    }

    // Resolve geocoding for events missing real coordinates, in parallel.
    final resolvedEvents = await Future.wait(events.map((ev) async {
      final lat = ev['lat'];
      final lng = ev['lng'];
      final location = ev['location'] as String?;

      final needsGeocode = (lat == null || lng == null || (lat == 0.0 && lng == 0.0)) &&
          location != null &&
          location.isNotEmpty;

      if (!needsGeocode) return ev;

      if (_geocodeCache.containsKey(location)) {
        final cached = _geocodeCache[location]!;
        return {...ev, 'lat': cached.latitude, 'lng': cached.longitude};
      }

      try {
        final pos = await _geocodeLocation(location);
        _geocodeCache[location] = pos;
        return {...ev, 'lat': pos.latitude, 'lng': pos.longitude};
      } catch (_) {
        return ev; // leave as-is; _eventPosition will just return null for it
      }
    }));

    if (mounted) {
      _rawEvents = resolvedEvents;
      _applyFilters();
    }
  }

  /// Filters the already-fetched events locally, no network call.
  void _applyFilters() {
    final filtered = <Map<String, dynamic>>[];

    for (final ev in _rawEvents) {
      if (!_matchesFilters(ev)) {
        continue;
      }

      if (widget.searchQuery != null && widget.searchQuery!.trim().isNotEmpty) {
        final title = (ev['title'] as String? ?? '').toLowerCase();
        final description = (ev['description'] as String? ?? '').toLowerCase();
        final query = widget.searchQuery!.trim().toLowerCase();
        if (!title.contains(query) && !description.contains(query)) {
          continue;
        }
      }

      filtered.add(ev);
    }

    final newMarkers = <Marker>{};
    for (final ev in filtered) {
      final pos = _eventPosition(ev);
      if (pos != null) {
        newMarkers.add(_buildMarkerForEvent(ev, pos));
      } else {
        debugPrint('EventsMaps: no position for event "${ev['title']}" (location: ${ev['location']})');
      }
    }

    if (mounted) {
      setState(() {
        _events = filtered;
        _markers = newMarkers;
      });
    }
  }

  bool _matchesFilters(Map<String, dynamic> event) {
    final selectedCategories = widget.categoryFilters;
    if (selectedCategories != null && selectedCategories.isNotEmpty) {
      final category = (event['category'] as String? ?? '').toUpperCase();
      final hasMatchingCategory = selectedCategories.any(
        (filter) => filter.toUpperCase() == category,
      );
      if (!hasMatchingCategory) {
        return false;
      }
    }

    final selectedSdgs = widget.sdgFilters;
    if (selectedSdgs != null && selectedSdgs.isNotEmpty) {
      final eventSdgs = <int>{};
      final rawSdg = event['sdg'];
      if (rawSdg is List) {
        for (final value in rawSdg) {
          if (value is num) {
            eventSdgs.add(value.toInt());
          } else if (value is String) {
            final parsed = int.tryParse(value);
            if (parsed != null) {
              eventSdgs.add(parsed);
            }
          }
        }
      } else if (rawSdg is num) {
        eventSdgs.add(rawSdg.toInt());
      }

      if (eventSdgs.intersection(selectedSdgs.toSet()).isEmpty) {
        return false;
      }
    }

    if (_hasLocation && widget.maxDistanceKm != null) {
      final pos = _eventPosition(event);
      if (pos == null) {
        return false;
      }
      final distanceKm = _distanceMeters(_center, pos) / 1000;
      if (distanceKm > widget.maxDistanceKm!) {
        return false;
      }
    }

    return true;
  }

  Future<LatLng> _geocodeLocation(String address) async {
    try {
      final uri = Uri.parse(
        'https://maps.googleapis.com/maps/api/geocode/json?address=${Uri.encodeComponent(address)}&key=${widget.mapsApiKey}',
      );
      final response = await http.get(uri);
      if (response.statusCode != 200) {
        throw Exception('Failed to geocode location');
      }

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final results = body['results'] as List<dynamic>?;
      if (results == null || results.isEmpty) {
        throw Exception('Failed to geocode location');
      }

      final location = results.first['geometry']['location'];
      return LatLng(
        (location['lat'] as num).toDouble(),
        (location['lng'] as num).toDouble(),
      );
    } catch (_) {
      throw Exception('Failed to geocode location');
    }
  }

  LatLng? _eventPosition(Map<String, dynamic> event) {
    final lat = event['lat'];
    final lng = event['lng'];
    if (lat != null && lng != null) {
      if (lat == 0.0 && lng == 0.0) {
        return null;
      }
      return LatLng(lat, lng);
    }
    return null;
  }

  Marker _buildMarkerForEvent(Map<String, dynamic> ev, LatLng pos) {
    final id = ev['eventId']?.toString() ?? ev['id']?.toString() ?? UniqueKey().toString();
    return Marker(
      markerId: MarkerId(id),
      position: pos,
      icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
      infoWindow: InfoWindow(
        title: ev['title']?.toString() ?? 'Event',
        snippet: ev['location']?.toString(),
      ),
      onTap: () => _onMarkerTap(ev, pos),
    );
  }

  void _onMarkerTap(Map<String, dynamic> ev, LatLng pos) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final bottomInset = MediaQuery.of(context).padding.bottom;

        return Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + bottomInset),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                ev['title']?.toString() ?? 'Event',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(ev['location']?.toString() ?? ''),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.arrow_forward_rounded, size: 18),
                  label: const Text('View Event'),
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => EventDetailScreen(event: ev)),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(44),
                  ),
                ),
              ),
            ],
          ),
        );
      },
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
      _mapController!.animateCamera(
        CameraUpdate.newCameraPosition(CameraPosition(target: target, zoom: zoom)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final nearest = List<Map<String, dynamic>>.from(_events);
    if (_hasLocation) {
      nearest.sort((a, b) {
        final aPos = _eventPosition(a);
        final bPos = _eventPosition(b);
        final ad = aPos == null ? double.infinity : _distanceMeters(_center, aPos);
        final bd = bPos == null ? double.infinity : _distanceMeters(_center, bPos);
        return ad.compareTo(bd);
      });
    }

    return Stack(
      fit: StackFit.expand,
      children: [
        // Map fills the whole available space.
        _loading
            ? Container(
                color: AppTheme.primary.withOpacity(0.06),
                child: const Center(child: CircularProgressIndicator()),
              )
            : GoogleMap(
                mapType: MapType.hybrid,
                initialCameraPosition: CameraPosition(target: _center, zoom: _zoom),
                markers: _markers,
                myLocationEnabled: true,
                myLocationButtonEnabled: true,
                zoomControlsEnabled: true,
                padding: const EdgeInsets.only(top: 150, bottom: 150),
                onMapCreated: (controller) {
                  _mapController = controller;
                  // If position resolved after the map was created, recenter now.
                  if (_hasLocation) {
                    controller.animateCamera(CameraUpdate.newLatLngZoom(_center, _zoom));
                  }
                },
              ),

        // Event cards float on top of the map, pinned to the bottom.
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: SafeArea(
            top: false,
            child: SizedBox(
              height: 130,
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: nearest.length,
                itemBuilder: (context, index) {
                  final ev = nearest[index];
                  final pos = _eventPosition(ev);
                  final dist = pos != null ? _distanceMeters(_center, pos) : null;
                  final imageUrls = (ev['imageUrls'] as List<dynamic>?)
                      ?.map((e) => e.toString())
                      .where((e) => e.isNotEmpty)
                      .toList();
                  final firstImage = (imageUrls != null && imageUrls.isNotEmpty) ? imageUrls.first : null;

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: SizedBox(
                      width: 240,
                      child: Card(
                        clipBehavior: Clip.antiAlias,
                        child: InkWell(
                          onTap: () {
                            if (pos != null) {
                              _moveCamera(pos, 14);
                            }
                          },
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              if (firstImage != null)
                                Image.network(
                                  firstImage,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      color: AppTheme.primary.withOpacity(0.15),
                                    );
                                  },
                                )
                              else
                                Container(color: AppTheme.primary.withOpacity(0.15)),

                              Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                    colors: [
                                      Colors.black.withOpacity(0.85),
                                      Colors.black.withOpacity(0.55),
                                      Colors.black.withOpacity(0.0),
                                    ],
                                    stops: const [0.0, 0.4, 0.7],
                                  ),
                                ),
                              ),

                              Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Text(
                                      ev['title']?.toString() ?? 'Event',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        color: Colors.white,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      ev['location']?.toString() ?? '',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 13, color: Colors.white70),
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          ev['attendeeCount'] != null
                                              ? '${ev['attendeeCount']} attendees'
                                              : 'No attendees info',
                                          style: const TextStyle(fontSize: 12, color: Colors.white70),
                                        ),
                                        Text(
                                          (_hasLocation && dist != null) ? '${(dist / 1000).toStringAsFixed(1)} km' : '',
                                          style: const TextStyle(fontSize: 12, color: Colors.white70),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ],
    );
  }
}