import 'dart:convert';
import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/session_storage.dart';
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
  static const String baseUrl = 'https://adc-final.appspot.com';

  /// Global navigator key to allow logout/redirect from service layer.
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  /// Cache for user roles to avoid redundant network calls.
  static final Map<String, String> _roleCache = {};

  /// Invalidates the role cache for a specific user.
  static void invalidateRoleCache(String username) {
    _roleCache.remove(username);
  }

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
        }
      }),
    );

    final body = _parseBody(response.body);
    return _extractData(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
      _checkBodyError(body, statusCode: response.statusCode);
      return _extractData(body, statusCode: response.statusCode);
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

    final body = _parseBody(response.body);
    _checkBodyError(body, statusCode: response.statusCode);
  }

  /// Calls POST /modaccount. Auth required (Owner).
  static Future<void> modifyAccount({
    required String jwt,
    required String username,
    required String email,
    String? displayName,
    String? bio,
    List<String>? categories,
    String? country,
    int? birth,
    String? avatar,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/modaccount');

    final requestBody = {
      'token': {
        'jwt': jwt,
      },
      'input': {
        'username': displayName ?? username,
        'email': email,
        'bio': bio,
        'category': categories?.map((c) => c.toUpperCase()).toList(),
        'country': country,
        'birth': birth,
        'avatar': avatar,
      }..removeWhere((k, v) => v == null)
    };

    // TEMP DEBUG — remove once the persistence issue is confirmed fixed.
    // Avatar is a data: URI and can be huge, so it's redacted from the log.
    developer.log(
      'REQUEST body: ${jsonEncode({
        ...requestBody,
        'input': {
          ...requestBody['input'] as Map,
          if ((requestBody['input'] as Map).containsKey('avatar'))
            'avatar': '<redacted, ${avatar?.length ?? 0} chars>',
        },
      })}',
      name: 'ApiService.modifyAccount',
    );

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(requestBody),
    );

    // TEMP DEBUG — remove once the persistence issue is confirmed fixed.
    developer.log(
      'RESPONSE statusCode: ${response.statusCode}, body: ${response.body}',
      name: 'ApiService.modifyAccount',
    );

    final body = _parseBody(response.body);

    // TEMP DEBUG — remove once the persistence issue is confirmed fixed.
    developer.log(
      'PARSED body: $body (empty map means response.body was not valid JSON)',
      name: 'ApiService.modifyAccount',
    );

    _checkBodyError(body, statusCode: response.statusCode);
  }

  /// Clears local session and redirects to Login screen.
  static Future<void> forceLogout() async {
    final jwt = await SessionStorage.getJwt();
    if (jwt == null || jwt.isEmpty) return; // Already logged out or Guest

    await SessionStorage.clear();
    navigatorKey.currentState?.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
    );
  }

  /// Proactively checks if the current session has expired based on stored timestamp.
  static Future<bool> isSessionExpired() async {
    final expiresAt = await SessionStorage.getExpiresAt();
    if (expiresAt == null || expiresAt == 0) return false;

    // expiresAt is in seconds
    final nowSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    return nowSeconds >= expiresAt;
  }

  /// Checks if the session is expired and logs out if it is.
  static Future<void> checkAndForceLogout() async {
    if (await isSessionExpired()) {
      await forceLogout();
    }
  }

  static void _checkBodyError(Map<String, dynamic> body, {bool redirectOnError = true, int? statusCode}) {
    final status = body['status'];
    final httpFailed = statusCode != null && (statusCode < 200 || statusCode >= 300);
    // 200 = ok, any 99xx = error. Also treat any non-2xx HTTP status as an
    // error even if the response body was empty/unparseable (e.g. a 500
    // from the backend with an HTML error page instead of JSON) — otherwise
    // _parseBody's fallback to {} makes a failed request look like success.
    if ((status != null && status != 200 && status != '200') || httpFailed) {
      final dynamic data = body['data'];
      String message = 'Operation failed (status ${status ?? statusCode})';

      // 9901/9902 are typical "Unauthorized" or "Token Expired" codes in this backend.
      // Also check for 401/403 HTTP status codes.
      if (status == 9901 || status == 9902 || status == '9901' || status == '9902' || statusCode == 401 || statusCode == 403) {
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
  static Map<String, dynamic> _extractData(Map<String, dynamic> body, {bool redirectOnError = true, int? statusCode}) {
    _checkBodyError(body, redirectOnError: redirectOnError, statusCode: statusCode);
    final data = body['data'];
    if (data is Map<String, dynamic>) return data;
    // If data is a String but we expected a Map, it might be an error message
    // that should have been caught by _checkBodyError, but we'll be safe here.
    return body;
  }

  static int normalizeTimestamp(dynamic value) {
    if (value == null) return 0;
    num? n = value is num ? value : num.tryParse(value.toString());
    if (n == null) return 0;
    int ts = n.toInt();
    final magnitude = ts.abs();

    if (magnitude == 0) return 0;

    // 1. Huge values (> 10^15) are likely nanoseconds absolute.
    if (magnitude > 1000000000000000) {
      return ts ~/ 1000000000;
    }

    // 2. Very large values (> 10^12) are likely milliseconds absolute.
    if (magnitude > 1000000000000) {
      return ts ~/ 1000;
    }

    // 3. Values between 10^9 and 10^12 are likely seconds absolute (e.g., year 2001+).
    if (magnitude > 1000000000) {
      return ts;
    }

    // 4. Values below 10^9 are treated as relative durations in seconds.
    // (Note: even 30 years in seconds is < 10^9).
    return (DateTime.now().millisecondsSinceEpoch ~/ 1000) + ts;
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
      event['startDate'] = normalizeTimestamp(event['startDate']);
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
      post['createdAt'] = normalizeTimestamp(post['createdAt']);
    }
    return post;
  }

  static Map<String, dynamic> _normalizeUser(Map<String, dynamic> user) {
    if (user['creation_time'] != null) {
      user['creation_time'] = normalizeTimestamp(user['creation_time']);
    }
    if (user['birth'] != null) {
      user['birth'] = normalizeTimestamp(user['birth']);
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
    return _normalizeEventPayload(_extractData(body, statusCode: response.statusCode));
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
    bool redirectOnError = false,
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
    return _normalizeEventPayload(_extractData(body, redirectOnError: redirectOnError, statusCode: response.statusCode));
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    final data = _extractData(body, statusCode: response.statusCode);
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
    final data = _extractData(body, redirectOnError: redirectOnError, statusCode: response.statusCode);
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
    final data = _extractData(body, redirectOnError: redirectOnError, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
  }

  /// Retrieves a user's role, using a cache to avoid redundant calls.
  static Future<String?> getRoleForUser({
    required String jwt,
    required String username,
  }) async {
    if (_roleCache.containsKey(username)) {
      return _roleCache[username];
    }
    try {
      final user = await getUserAccount(jwt: jwt, username: username, redirectOnError: false);
      final role = user['role'] as String?;
      if (role != null) {
        _roleCache[username] = role;
      }
      return role;
    } catch (_) {
      return null;
    }
  }

  /// Calls POST /rest/user. Auth required.
  static Future<Map<String, dynamic>> getUserAccount({
    required String jwt,
    required String username,
    bool redirectOnError = false,
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
    return _normalizeUser(_extractData(body, redirectOnError: redirectOnError, statusCode: response.statusCode));
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
    return _extractData(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
          'newRole': newRole,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body, statusCode: response.statusCode);

    // Invalidate cache so UI components fetch the fresh role
    invalidateRoleCache(username);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    _checkBodyError(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
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
          'newName': nickname,
        },
      }),
    );
    final body = _parseBody(response.body);
    _checkBodyError(body, statusCode: response.statusCode);
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
    return _extractData(body, statusCode: response.statusCode);
  }

  /// Calls GET /rest/forum/cleanup. Cron only.
  static Future<Map<String, dynamic>> cleanupForum() async {
    final uri = Uri.parse('$baseUrl/rest/forum/cleanup');
    final response = await http.get(
      uri,
      headers: {'X-AppEngine-Cron': 'true'},
    );
    final body = _parseBody(response.body);
    return _extractData(body, statusCode: response.statusCode);
  }
}