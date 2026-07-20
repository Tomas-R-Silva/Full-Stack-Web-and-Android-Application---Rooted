import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'session_storage.dart';
import '../screens/login_screen.dart';

/// Thrown when the backend returns a non-success response.
class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}

class ApiService {
  // Your deployed Google Cloud backend.
  static const String baseUrl = 'https://adc-final.ey.r.appspot.com';

  /// Global navigator key to allow logout/redirect from service layer.
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  static const List<String> categories = [
    'Music',
    'Sports',
    'Tech',
    'Food',
    'Art',
    'Business',
    'Community',
    'Health',
    'Education',
    'Other',
  ];

  /// Notifies listeners when an event is joined or left.
  static final ValueNotifier<String?> eventUpdateNotifier = ValueNotifier(null);

  // Local cache to handle eventual consistency and cross-screen sync
  static final Set<String> _locallyAttending = {};
  static final Set<String> _locallyNotAttending = {};

  static void notifyEventUpdate(String? eventId, {bool? isAttending}) {
    if (eventId != null && isAttending != null) {
      if (isAttending) {
        _locallyAttending.add(eventId);
        _locallyNotAttending.remove(eventId);
      } else {
        _locallyNotAttending.add(eventId);
        _locallyAttending.remove(eventId);
      }
    }
    eventUpdateNotifier.value = eventId;
  }

  /// Checks the attendance status against the local cache.
  static bool checkAttendance(String eventId, bool serverStatus) {
    if (_locallyAttending.contains(eventId)) return true;
    if (_locallyNotAttending.contains(eventId)) return false;
    return serverStatus;
  }

  /// Calls POST /createaccount. Public.
  static Future<Map<String, dynamic>> createAccount({
    required String username,
    required String email,
    required String password,
    String role = 'USER',
    List<String> interests = const [],
  }) async {
    final uri = Uri.parse('$baseUrl/rest/createaccount');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {
          'username': username,
          'email': email,
          'password': password,
          'confirmation': password,
          'category': interests.map((c) => c.toUpperCase()).toList(),
          'role': role,
          'public': true,
        }
      }),
    );

    final body = _parseBody(response.body);
    return _extractData(body);
  }


  /// Calls POST /login. Public.
  static Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/login');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {
          'username': username,
          'password': password,
        },
      }),
    );

    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /logout. Auth required.
  static Future<void> logout({
    required String username,
    required String jwt,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/logout');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {'username': username},
        'token': {
          'jwt': jwt,
        },
      }),
    );

    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /deleteaccount. ADMIN only.
  static Future<void> deleteAccount({
    required String username,
    required String jwt,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/deleteaccount');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {'username': username},
        'token': {
          'jwt': jwt,
        },
      }),
    );

    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /events/create.
  ///
  /// Mirrors EventResources.createEvent, which authenticates via
  /// AuthHelper.verifyToken(req.getToken()) (needs a jwt) and expects
  /// title, description, category, location, startDate (epoch seconds),
  /// durationMinutes, maxAttendees and public. Returns the new eventId.
  static Future<Map<String, dynamic>> createEvent({
    required String jwt,
    required String title,
    required String description,
    required String category,
    required String location,
    required int startDate,
    required int durationMinutes,
    required int maxAttendees,
    required bool public,
    required double latitude,
    required double longitude,
    String? username,
    int minAttendees = 0,
    bool isAccessible = false,
    List<int> sdg = const [],
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/create');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {
          'jwt': jwt,
        },
        'input': {
          'title': title,
          'description': description,
          'category': category,
          'location': location,
          'startDate': startDate,
          'durationMinutes': durationMinutes,
          'maxAttendees': maxAttendees,
          'minAttendees': minAttendees,
          'public': public,
          'accessible': isAccessible,
          'sdg': sdg,
          'lat': latitude,
          'lng': longitude,
        }
      }),
    );

    final body = _parseBody(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      _checkBodyError(body);
      return _extractData(body);
    }

    throw ApiException(_errorMessage(
      body,
      'Event creation failed (status ${response.statusCode})',
    ));
  }

  /// Calls POST /events/update.
  ///
  /// Mirrors EventResources.updateEvent. Only the organizer or an ADMIN
  /// may call this. Fields left null are left unchanged server-side.
  static Future<void> updateEvent({
    required String jwt,
    required String eventId,
    String? username,
    String? title,
    String? description,
    String? category,
    String? location,
    double? latitude,
    double? longitude,
    int? startDate,
    int? durationMinutes,
    int? maxAttendees,
    int? minAttendees,
    bool? public,
    bool? isAccessible,
    List<int>? sdg,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/update');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {
          'jwt': jwt,
        },
        'input': {
          'eventId': eventId,
          'title': title,
          'description': description,
          'category': category,
          'location': location,
          'lat': latitude,
          'lng': longitude,
          'startDate': startDate,
          'durationMinutes': durationMinutes,
          'maxAttendees': maxAttendees,
          'minAttendees': minAttendees,
          'public': public,
          'accessible': isAccessible,
          'sdg': sdg,
        }..removeWhere((k, v) => v == null)
      }),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return;
    }

    Map<String, dynamic> body;
    try {
      body = jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      body = {};
    }

    final message = body['message']?.toString() ??
        body['error']?.toString() ??
        'Event update failed (status ${response.statusCode})';
    throw ApiException(message);
  }

  /// Calls POST /modaccount. Auth required (Owner).
  static Future<void> modifyAccount({
    required String jwt,
    required String username,
    required String email,
    String? bio,
    List<String>? categories,
    String? country,
    int? birth,
    String? avatar,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/modaccount');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {
          'jwt': jwt,
        },
        'input': {
          'username': username,
          'email': email,
          'bio': bio,
          'category': categories?.map((c) => c.toUpperCase()).toList(),
          'country': country,
          'birth': birth,
          'avatar': avatar,
        }..removeWhere((k, v) => v == null)
      }),
    );

    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Clears local session and redirects to Login screen.
  static Future<void> forceLogout() async {
    await SessionStorage.clear();
    navigatorKey.currentState?.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  static void _checkBodyError(Map<String, dynamic> body, {bool redirectOnError = true}) {
    final status = body['status'];
    // 200 = ok, any 99xx = error.
    if (status != null && status != 200 && status != '200') {
      final dynamic data = body['data'];
      String message = 'Operation failed (status $status)';

      // 9901/9902 are typical "Unauthorized" or "Token Expired" codes in this backend.
      if (status == 9901 || status == 9902 || status == '9901' || status == '9902') {
        if (redirectOnError) forceLogout();
        throw ApiException('Session expired. Please log in again.');
      }

      if (data is String) {
        message = data;
      } else if (data is List) {
        // Validation error structure: { "status": 9906, "data": [ { "status": 9930, "data": "INVALID_MESSAGE_TEXT" } ] }
        final List<String> errors = [];
        for (final item in data) {
          if (item is Map && item.containsKey('data')) {
            errors.add(item['data'].toString());
          }
        }
        if (errors.isNotEmpty) {
          message = errors.join(', ');
        }
      } else if (body.containsKey('message')) {
        message = body['message'].toString();
      } else if (body.containsKey('error')) {
        message = body['error'].toString();
      }

      throw ApiException(message);
    }
  }

  static Map<String, dynamic> _parseBody(String raw) {
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return {};
    }
  }

  static String _errorMessage(Map<String, dynamic> body, String fallback) =>
      body['message']?.toString() ?? body['error']?.toString() ?? fallback;

  /// Safely unwraps a response body's `data` field.
  ///
  /// Some backend responses nest the payload under `data` (an object),
  /// but if `data` is missing, null, or not actually a Map (e.g. a plain
  /// string message), this falls back to the whole body instead of
  /// crashing with "type 'String' is not a subtype of type
  static Map<String, dynamic> _extractData(Map<String, dynamic> body, {bool redirectOnError = true}) {
    _checkBodyError(body, redirectOnError: redirectOnError);
    final data = body['data'];
    if (data is Map<String, dynamic>) return data;
    // If data is a String but we expected a Map, it might be an error message
    // that should have been caught by _checkBodyError, but we'll be safe here.
    return body;
  }

  static int _normalizeTimestamp(dynamic value) {
    if (value == null) return 0;
    int ts = (value as num).toInt();
    final magnitude = ts.abs();
    if (magnitude > 1000000000000000) return ts ~/ 1000000000; // Nanoseconds -> Seconds
    if (magnitude > 1000000000000) return ts ~/ 1000;       // Milliseconds -> Seconds
    if (magnitude > 10000000000) return 0;
    return ts;
  }

  /// Workaround for the current backend: EventResources#entityToMap puts the
  /// SDG list under the key "SDG" (all caps) instead of "sdg", so every
  /// screen that reads event['sdg'] gets nothing. This copies whichever
  /// case-insensitive "sdg" key is present into a normalized 'sdg' entry,
  /// without touching anything else. Safe to remove once the backend is
  /// fixed to emit 'sdg' directly.
  static Map<String, dynamic> _normalizeEvent(Map<String, dynamic> event) {
    // 1. Normalize SDG key: backend often returns "SDG" instead of "sdg"
    final currentSdg = event['sdg'];
    if (!(currentSdg is List && currentSdg.isNotEmpty)) {
      for (final key in event.keys) {
        if (key != 'sdg' && key.toLowerCase() == 'sdg') {
          final value = event[key];
          if (value is List) {
            event['sdg'] = value;
          }
          break;
        }
      }
    }

    // 2. Normalize timestamps
    if (event['startDate'] != null) {
      event['startDate'] = _normalizeTimestamp(event['startDate']);
    }

    // 2. Normalize imageUrls: backend returns List<Map<String, String>> with {id, url}
    final imgs = event['imageUrls'];
    if (imgs is List) {
      event['imageUrls'] = imgs.map<String>((img) {
        String url = '';
        if (img is Map) {
          // Extract just the URL for backward compatibility with UI that expects List<String>
          url = img['url']?.toString() ?? '';
        } else {
          url = img.toString();
        }
        
        if (url.isNotEmpty && !url.startsWith('http')) {
          // If it's a relative path (with or without leading slash), prepend baseUrl
          final normalizedPath = url.startsWith('/') ? url : '/$url';
          url = '$baseUrl$normalizedPath';
        }
        
        return url;
      }).toList();
      
      // Also keep the full objects in a separate key if needed for deletion later
      event['_imageObjects'] = imgs;
    }

    return event;
  }

  /// Applies [_normalizeEvent] to a single event map or to every event
  /// inside a `{'events': [...]}` list payload; leaves anything else as-is.
  static Map<String, dynamic> _normalizeEventPayload(Map<String, dynamic> data) {
    final event = data['event'];
    if (event is Map<String, dynamic>) {
      _normalizeEvent(event);
    }
    final events = data['events'];
    if (events is List) {
      for (final e in events) {
        if (e is Map<String, dynamic>) _normalizeEvent(e);
      }
    }
    return data;
  }

  static Map<String, dynamic> _normalizeForumPost(Map<String, dynamic> post) {
    if (post['createdAt'] != null) {
      post['createdAt'] = _normalizeTimestamp(post['createdAt']);
    }
    return post;
  }

  static Map<String, dynamic> _normalizeUser(Map<String, dynamic> user) {
    if (user['creation_time'] != null) {
      user['creation_time'] = _normalizeTimestamp(user['creation_time']);
    }
    if (user['birth'] != null) {
      user['birth'] = _normalizeTimestamp(user['birth']);
    }
    // Normalize category (interests) to a List<String>
    final cat = user['category'];
    List<String> rawCats = [];
    if (cat is String && cat.isNotEmpty) {
      rawCats = cat.split(',').map((e) => e.trim()).toList();
    } else if (cat is List) {
      rawCats = cat.cast<String>();
    }

    user['category_list'] = rawCats.map((e) {
      return categories.firstWhere(
        (c) => c.toLowerCase() == e.toLowerCase(),
        orElse: () => e,
      );
    }).toList();

    user['ods'] ??= List.filled(17, 0);
    user['borderID'] ??= "";
    user['points'] ??= 0;
    user['isPublic'] ??= "true";
    user['friendship'] ??= "SELF";

    // Normalize avatar
    final avatarObj = user['avatar'];
    if (avatarObj is Map) {
      user['avatar_url'] = avatarObj['url']?.toString() ?? '';
    } else {
      user['avatar_url'] = '';
    }

    return user;
  }

  /// Calls POST /rest/events/get.
  static Future<Map<String, dynamic>> getEvent({
    required String eventId,
    String? jwt,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/get');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {'eventId': eventId},
        if (jwt != null) 'token': {'jwt': jwt},
      }),
    );
    final body = _parseBody(response.body);
    return _normalizeEventPayload(_extractData(body));
  }

  /// Calls POST /rest/events/list. Public.
  static Future<Map<String, dynamic>> listEvents({
    String? jwt,
    String? organizerUsername,
    String? status,
    String? category,
    bool? isAccessible,
    List<int>? sdg,
    int pageSize = 50,
    String? cursor,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/list');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        if (jwt != null) 'token': {
          'jwt': jwt,
        },
        'input': {
          'organizerUsername': organizerUsername,
          'status': status,
          'category': category,
          'isAccessible': isAccessible,
          'sdg': sdg,
          'pageSize': pageSize,
          'cursor': cursor,
        }..removeWhere((k, v) => v == null)
      }),
    );
    final body = _parseBody(response.body);
    return _normalizeEventPayload(_extractData(body));
  }

  /// Calls POST /rest/events/addpartner. Auth required Organizer or ADMIN.
  static Future<void> addPartner({
    required String jwt,
    required String eventId,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/addpartner');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'eventId': eventId,
          'username': username,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/events/removepartner. Auth required Organizer or ADMIN.
  static Future<void> removePartner({
    required String jwt,
    required String eventId,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/removepartner');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'eventId': eventId,
          'username': username,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/events/cancel. Auth required Organizer or ADMIN.
  static Future<void> cancelEvent({
    required String jwt,
    required String eventId,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/cancel');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'eventId': eventId},
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/events/delete. Auth required Organizer or ADMIN.
  static Future<void> deleteEvent({
    required String jwt,
    required String eventId,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/delete');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'eventId': eventId},
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/events/attendees. Auth required Organizer, ADMIN or BOFFICER.
  static Future<Map<String, dynamic>> getAttendees({
    required String jwt,
    required String eventId,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/attendees');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'eventId': eventId},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/events/joinrequests. Auth required Organizer, ADMIN or BOFFICER.
  static Future<Map<String, dynamic>> listJoinRequests({
    required String jwt,
    required String eventId,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/joinrequests');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'eventId': eventId},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/events/respondjoin. Auth required Organizer, ADMIN or BOFFICER.
  static Future<void> respondJoinRequest({
    required String jwt,
    required String eventId,
    required String username,
    required bool accept,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/respondjoin');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'eventId': eventId,
          'username': username,
          'accept': accept,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/events/myattends. Auth required (Owner, ADMIN or BOFFICER).
  static Future<Map<String, dynamic>> getMyAttends({
    required String jwt,
    required String eventId,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/myattends');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'eventId': eventId},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/events/isattendee. Auth required.
  static Future<bool> isAttendee({
    required String jwt,
    required String eventId,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/isattendee');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {
          'jwt': jwt,
        },
        'input': {
          'username': username,
          'eventId': eventId,
        },
      }),
    );
    final body = _parseBody(response.body);
    final data = _extractData(body);
    return data['isattendee'] == true;
  }

  /// Calls POST /rest/forum/post. Auth required.
  static Future<Map<String, dynamic>> postForumMessage({
    required String jwt,
    required String id,
    String type = 'EVENT',
    required String text,
    String? parentPostId,
    bool redirectOnError = true,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/forum/post');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {
          'jwt': jwt,
        },
        'input': {
          'id': id,
          'type': type,
          'text': text,
          'parentPostId': parentPostId,
        }..removeWhere((k, v) => v == null)
      }),
    );

    final body = _parseBody(response.body);
    final data = _extractData(body, redirectOnError: redirectOnError);
    _normalizeForumPost(data);
    return data;
  }

  /// Calls POST /rest/forum/list. Auth required.
  static Future<Map<String, dynamic>> listForumMessages({
    required String jwt,
    required String id,
    String type = 'EVENT',
    int pageSize = 50,
    String? cursor,
    bool redirectOnError = true,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/forum/list');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {
          'jwt': jwt,
        },
        'input': {
          'id': id,
          'type': type,
          'pageSize': pageSize,
          'cursor': cursor,
        }..removeWhere((k, v) => v == null)
      }),
    );
    final body = _parseBody(response.body);
    final data = _extractData(body, redirectOnError: redirectOnError);
    final posts = data['posts'];
    if (posts is List) {
      for (final p in posts) {
        if (p is Map<String, dynamic>) _normalizeForumPost(p);
      }
    }
    return data;
  }

  /// Calls POST /rest/forum/delete. Auth required Author, Organizer or ADMIN.
  static Future<void> deleteForumPost({
    required String jwt,
    required String postId,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/forum/delete');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'forumKey': postId},
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/events/attend. Auth required.
  static Future<Map<String, dynamic>> attendEvent({
    required String jwt,
    required String eventId,
    String? username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/attend');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {
          'jwt': jwt,
        },
        'input': {'eventId': eventId},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/events/unattend. Auth required.
  static Future<Map<String, dynamic>> unattendEvent({
    required String jwt,
    required String eventId,
    String? username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/unattend');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {
          'jwt': jwt,
        },
        'input': {'eventId': eventId},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/events/kick. Auth required Organizer or ADMIN.
  static Future<void> kickAttendee({
    required String jwt,
    required String eventId,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/kick');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'eventId': eventId,
          'username': username,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/events/uploadimages. Auth required Organizer or ADMIN.
  static Future<void> uploadEventImages({
    required String jwt,
    required String eventId,
    required List<String> base64Images,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/uploadimages');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'eventId': eventId,
          'images': base64Images,
        },
      }),
    );

    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/events/uploadimageurls. Auth required Organizer or ADMIN.
  static Future<void> uploadImageUrls({
    required String jwt,
    required String eventId,
    required List<String> imageUrls,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/uploadimageurls');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'eventId': eventId,
          'images': imageUrls,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/events/deleteimage. Auth required Organizer or ADMIN.
  static Future<void> deleteImages({
    required String jwt,
    required String eventId,
    required List<String> imageIds,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/events/deleteimage');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'eventId': eventId,
          'imageIds': imageIds,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/user. Auth required.
  static Future<Map<String, dynamic>> getUserAccount({
    required String jwt,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/user');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'username': username},
      }),
    );
    final body = _parseBody(response.body);
    return _normalizeUser(_extractData(body));
  }

  /// Calls POST /rest/find. Auth required.
  static Future<Map<String, dynamic>> findUsers({
    required String jwt,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/find');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'username': username},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/showusers. ADMIN or BOFFICER.
  static Future<Map<String, dynamic>> showUsers({
    required String jwt,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/showusers');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/showuserrole. ADMIN or BOFFICER.
  static Future<Map<String, dynamic>> showUserRole({
    required String jwt,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/showuserrole');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'username': username},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/changeborder. Auth required USER (self).
  static Future<Map<String, dynamic>> changeBorder({
    required String jwt,
    required String borderID,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/changeborder');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'borderID': borderID},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/changeuserrole. ADMIN only.
  static Future<void> changeUserRole({
    required String jwt,
    required String username,
    required String newRole,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/changeuserrole');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'username': username,
          'newrole': newRole,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/changeuserpwd. Auth required Owner or ADMIN.
  static Future<void> changeUserPassword({
    required String jwt,
    required String username,
    required String oldPassword,
    required String newPassword,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/changeuserpwd');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'username': username,
          'oldpassword': oldPassword,
          'newpassword': newPassword,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/showauthsessions. ADMIN only.
  static Future<Map<String, dynamic>> showAuthSessions({
    required String jwt,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/showauthsessions');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/endfriend. ADMIN only.
  static Future<void> endFriendships({
    required String jwt,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/endfriend');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  //Friend Endpoints
  /// Calls POST /rest/addfriend. Auth required.
  static Future<void> addFriend({
    required String jwt,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/addfriend');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'username': username},
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/unfriend. Auth required.
  static Future<void> unfriend({
    required String jwt,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/unfriend');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'username': username},
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/showfriends. Auth required.
  static Future<Map<String, dynamic>> showFriends({
    required String jwt,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/showfriends');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'username': username},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/showfriendrequests. Auth required.
  static Future<Map<String, dynamic>> showFriendRequests({
    required String jwt,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/showfriendrequests');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls POST /rest/addnickname. Auth required.
  static Future<void> addNickname({
    required String jwt,
    required String username,
    required String nickname,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/addnickname');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {
          'username': username,
          'newname': nickname,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body);
  }

  /// Calls POST /rest/getnickname. Auth required.
  static Future<Map<String, dynamic>> getNickname({
    required String jwt,
    required String username,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/getnickname');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'input': {'username': username},
      }),
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }

  /// Calls GET /rest/forum/cleanup. Cron only.
  static Future<Map<String, dynamic>> cleanupForum() async {
    final uri = Uri.parse('$baseUrl/rest/forum/cleanup');
    final response = await http.get(
      uri,
      headers: {'X-AppEngine-Cron': 'true'},
    );
    final body = _parseBody(response.body);
    return _extractData(body);
  }
}
