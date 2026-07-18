import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:rooted/screens/event_detail_screen.dart';

import '../services/api_service.dart';
import '../theme/app_theme.dart';

class EventsMaps extends StatefulWidget {
  final String mapsApiKey = dotenv.env['MAPS_API_KEY'] ?? '';
  final List<String>? categoryFilters;
  final List<int>? sdgFilters;
  final String? searchQuery;

  EventsMaps({
    super.key,
    this.categoryFilters,
    this.sdgFilters,
    this.searchQuery,
  });

  @override
  State<EventsMaps> createState() => _EventsMapsState();
}

class _EventsMapsState extends State<EventsMaps> {
  GoogleMapController? _mapController;
  LatLng _center = const LatLng(0.0, 0.0);
  bool _loading = true;
  Set<Marker> _markers = {};
  List<Map<String, dynamic>> _events = [];

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
        widget.searchQuery != oldWidget.searchQuery;

    if (filtersChanged) {
      _fetchAndShowEvents();
    }
  }

  Future<void> _init() async {
    await _determinePosition();
    await _fetchAndShowEvents();
    if (mounted) {
      setState(() => _loading = false);
      _updateMapView();
    }
  }

  Future<void> _determinePosition() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        if (mounted) {
          _center = LatLng(position.latitude, position.longitude);
        }
      }
    } catch (_) {}
  }

  Future<void> _fetchAndShowEvents() async {
    if (!mounted) return;

    setState(() {
      _loading = true;
    });

    List<Map<String, dynamic>> events = [];

    try {
      final result = await ApiService.listEvents(
        status: 'UPCOMING',
        pageSize: 100,
      );
      final data = result;
      final eventsData = (data['events'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();

      for (final event in eventsData) {
        final evMap = Map<String, dynamic>.from(event);
        if (!_matchesFilters(evMap)) {
          continue;
        }

        if (widget.searchQuery != null && widget.searchQuery!.trim().isNotEmpty) {
          final title = (evMap['title'] as String? ?? '').toLowerCase();
          final description = (evMap['description'] as String? ?? '').toLowerCase();
          final query = widget.searchQuery!.trim().toLowerCase();
          if (!title.contains(query) && !description.contains(query)) {
            continue;
          }
        }

        events.add(evMap);
      }
    } catch (e) {
      debugPrint('EventsMaps: failed to fetch events: $e');
    }

    final newMarkers = <Marker>{};

    for (final ev in events) {
      final pos = await _resolveEventPosition(ev);
      if (pos != null) {
        newMarkers.add(_buildMarkerForEvent(ev, pos));
      } else {
        debugPrint('EventsMaps: no position for event "${ev['title']}" (location: ${ev['location']})');
      }
    }
    
    if (mounted) {
      setState(() {
        _events = events;
        _markers = newMarkers;
        _loading = false;
      });
      _updateMapView();
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

    return true;
  }

  LatLng? _eventPosition(Map<String, dynamic> event) {
    final lat = _readDouble(event['lat'] ?? event['latitude']);
    final lng = _readDouble(event['lng'] ?? event['longitude']);
    if (lat != null && lng != null) {
      return LatLng(lat, lng);
    }
    return null;
  }

  Future<LatLng?> _resolveEventPosition(Map<String, dynamic> event) async {
    final existing = _eventPosition(event);
    if (existing != null) {
      return existing;
    }

    return null;
  }

  double? _readDouble(dynamic value) {
    if (value is num) {
      return value.toDouble();
    }
    if (value is String) {
      return double.tryParse(value);
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
      builder: (context) => SafeArea(
        child: Padding(
          padding: EdgeInsets.fromLTRB(
            16,
            16,
            16,
            16 + MediaQuery.of(context).padding.bottom,
          ),
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
      _mapController!.animateCamera(
        CameraUpdate.newCameraPosition(CameraPosition(target: target, zoom: zoom)),
      );
    }
  }

  void _updateMapView() {
    if (_mapController == null) {
      return;
    }

    if (_markers.isEmpty) {
      _moveCamera(_center, 12);
      return;
    }
  }

  @override
  Widget build(BuildContext context) {
    final nearest = List<Map<String, dynamic>>.from(_events);
    if (_center.latitude != 0 || _center.longitude != 0) {
      nearest.sort((a, b) {
        final aPos = _eventPosition(a);
        final bPos = _eventPosition(b);
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
                    color: AppTheme.primary.withOpacity(0.06),
                    child: const Center(child: CircularProgressIndicator()),
                  )
                : GoogleMap(
                    mapType: MapType.hybrid,
                    initialCameraPosition: CameraPosition(target: _center, zoom: 1),
                    markers: _markers,
                    myLocationEnabled: true,
                    myLocationButtonEnabled: true,
                    zoomControlsEnabled: true,
                    onMapCreated: (controller) {
                      _mapController = controller;
                      _updateMapView();
                    },
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
                        // Background image or fallback color
                        if (firstImage != null)
                          Image.network(
                            firstImage,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              debugPrint('MAP EVENT IMAGE ERROR: $error');
                              debugPrint('IMAGE URL: $firstImage');
                              return Container(
                                color: AppTheme.primary.withOpacity(0.15),
                              );
                            },
                          )
                        else
                          Container(color: AppTheme.primary.withOpacity(0.15)),

                        // Gradient scrim so text stays readable
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

                        // Text content
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
                                    dist != null ? '${(dist / 1000).toStringAsFixed(1)} km' : '',
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
          },),
        ),
      ],
    );
  }
}