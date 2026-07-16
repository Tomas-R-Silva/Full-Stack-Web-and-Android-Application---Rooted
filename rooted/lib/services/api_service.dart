import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

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

  /// Calls POST /createaccount.
  ///
  /// Mirrors UserResources.createAccount, which stores user_name,
  /// user_email, user_pwd, user_role and user_creation_time.

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
          'confirmation' : password,
          'category': interests.map((c) => c.toUpperCase()).toList(),
          'role': role,
          'public': true,
        }
      }),
    );

    Map<String, dynamic> body;
    try {
      body = jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      body = {};
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      _checkBodyError(body);
      return body;
    }
    throw ApiException(
        body['message']?.toString() ??
            body['error']?.toString() ??
            'Registration failed'
    );
  }


  /// Calls POST /login.
  ///
  /// Mirrors UserResources.userLogin, which expects username + password
  /// and returns a token object containing jwt, username, role,
  /// issuedAt and expiresAt.
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

    Map<String, dynamic> body;
    try {
      body = jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      body = {};
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      _checkBodyError(body);
      return body;
    }

    final message = body['message']?.toString() ??
        body['error']?.toString() ??
        'Login failed (status ${response.statusCode})';
    throw ApiException(message);
  }

  /// Calls POST /logout.
  ///
  /// Mirrors UserResources.logOut, which expects a ShortUser (username)
  /// and the caller's Token (jwt), and deletes that session
  /// server-side.
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
        'Logout failed (status ${response.statusCode})';
    throw ApiException(message);
  }

  /// Calls POST /deleteaccount.
  ///
  /// Mirrors UserResources.deleteAccount, which expects a ShortUser
  /// (username) and the caller's Token (jwt), and permanently
  /// deletes the User entity plus all of that user's sessions.
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
        'Account deletion failed (status ${response.statusCode})';
    throw ApiException(message);
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
          'latitude': latitude,
          'longitude': longitude,
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

  /// Calls POST /modaccount.
  ///
  /// Mirrors UserResources.modifyAccount, which expects a username and
  /// an attributes object {address, phone}, plus a Token. Only the
  /// account owner, BOFFICER, or ADMIN may call this.
  static Future<void> modifyAccount({
    required String jwt,
    required String username,
    required String email,
    String? bio,
    List<String>? categories,
    String? country,
    int? birth,
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
          if (bio != null) 'bio': bio,
          if (categories != null) 'category': categories.map((c) => c.toUpperCase()).toList(),
          if (country != null) 'country': country,
          if (birth != null) 'birth': birth,
        },
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
        'Profile update failed (status ${response.statusCode})';
    throw ApiException(message);
  }

  static void _checkBodyError(Map<String, dynamic> body) {
    final status = body['status'];
    // Status can be int or String from backend. Non-zero usually means error.
    if (status != null && status != 0 && status != 200 && status != '0' && status != '200') {
      final message = body['message']?.toString() ??
          body['error']?.toString() ??
          body['data']?.toString() ??
          'Operation failed (status $status)';
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
  static Map<String, dynamic> _extractData(Map<String, dynamic> body) {
    _checkBodyError(body);
    final data = body['data'];
    if (data is Map<String, dynamic>) return data;
    // If data is a String but we expected a Map, it might be an error message
    // that should have been caught by _checkBodyError, but we'll be safe here.
    return body;
  }

  static int _normalizeTimestamp(dynamic value) {
    if (value == null) return 0;
    // Backend might return seconds, milliseconds, or nanoseconds (10^9, 10^12, or 10^18)
    // We normalize everything to SECONDS because the UI does value * 1000.
    int ts = (value as num).toInt();
    if (ts > 1000000000000000) return ts ~/ 1000000000; // Nanoseconds -> Seconds
    if (ts > 1000000000000) return ts ~/ 1000;       // Milliseconds -> Seconds
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
        if (img is Map) {
          // Extract just the URL for backward compatibility with UI that expects List<String>
          return img['url']?.toString() ?? '';
        }
        return img.toString();
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _normalizeEventPayload(_extractData(body));
    }
    throw ApiException(_errorMessage(body, 'Failed to load event'));
  }

  /// Calls POST /rest/events/list.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _normalizeEventPayload(_extractData(body));
    }
    throw ApiException(_errorMessage(body, 'Failed to list events'));
  }

  /// Calls POST /rest/events/addpartner.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to add partner'));
  }

  /// Calls POST /rest/events/removepartner.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to remove partner'));
  }

  /// Calls POST /rest/events/cancel.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to cancel event'));
  }

  /// Calls POST /rest/events/delete.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to delete event'));
  }

  /// Calls POST /rest/events/attendees.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to get attendees'));
  }

  /// Calls POST /rest/events/joinrequests.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to list join requests'));
  }

  /// Calls POST /rest/events/respondjoin.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to respond to join request'));
  }

  /// Calls POST /rest/events/myattends.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to get my attends'));
  }

  /// Calls POST /rest/events/isattendee.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = _extractData(body);
      return data['isattendee'] == true;
    }
    throw ApiException(_errorMessage(body, 'Failed to check attendance'));
  }

  /// Calls POST /rest/forum/post.

  static Future<Map<String, dynamic>> postForumMessage({
    required String jwt,
    String? eventId,
    String? id,
    String type = 'EVENT',
    required String text,
    String? username,
    String? parentPostId,
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
          'type': type,
          if (type == 'EVENT') 'eventId': eventId,
          if (type == 'FRIEND') 'id': id,
          'text': text,
          'parentPostId': parentPostId,
        }..removeWhere((k, v) => v == null)
      }),
    );

    final body = _parseBody(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = _extractData(body);
      _normalizeForumPost(data);
      return data;
    }

    throw ApiException(_errorMessage(body, 'Failed to post message'));
  }




  /// Calls POST /rest/forum/list.
  static Future<Map<String, dynamic>> listForumMessages({
    required String jwt,
    String? eventId,
    String? id,
    String type = 'EVENT',
    String? username,
    int pageSize = 50,
    String? cursor,
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
          'type': type,
          if (type == 'EVENT') 'eventId': eventId,
          if (type == 'FRIEND') 'id': id,
          'pageSize': pageSize,
          'cursor': cursor,
        }..removeWhere((k, v) => v == null)
      }),
    );
    final body = _parseBody(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final data = _extractData(body);
      final posts = data['posts'];
      if (posts is List) {
        for (final p in posts) {
          if (p is Map<String, dynamic>) _normalizeForumPost(p);
        }
      }
      return data;
    }
    throw ApiException(_errorMessage(body, 'Failed to load messages'));
  }

  /// Calls POST /rest/forum/delete.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to delete message'));
  }

  /// Calls POST /rest/events/attend.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to join event'));
  }

  /// Calls POST /rest/events/unattend.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to leave event'));
  }

  /// Calls POST /rest/events/uploadimages.
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

    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to upload images (Status ${response.statusCode})'));
  }

  /// Calls POST /rest/events/uploadimageurls.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to upload image URLs'));
  }

  /// Calls POST /rest/events/deleteimage.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to delete images'));
  }

  /// Calls POST /rest/user.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _normalizeUser(_extractData(body));
    }
    throw ApiException(_errorMessage(body, 'Failed to load user profile'));
  }

  /// Calls POST /find.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Search failed'));
  }

  /// Calls POST /showusers.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to show users'));
  }

  /// Calls POST /changeuserrole.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to change role'));
  }

  /// Calls POST /changeuserpwd.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to change password'));
  }

  /// Calls POST /showauthsessions.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to load sessions'));
  }

  /// Calls POST /endfriend.
  static Future<void> endFriendships({
    required String jwt,
  }) async {
    final uri = Uri.parse('$baseUrl/rest/endfriend');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt}, // Passed even if not checked by backend currently
      }),
    );
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to reset friendships'));
  }

  //Friend Endpoints
  /// Calls POST /addfriend.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to add friend'));
  }

  /// Calls POST /unfriend.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to unfriend'));
  }

  /// Calls POST /showfriends.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to show friends'));
  }

  /// Calls POST /showfriendrequests.
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
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to show friend requests'));
  }

  /// Calls POST /addnickname.
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
    if (response.statusCode >= 200 && response.statusCode < 300) return;
    final body = _parseBody(response.body);
    throw ApiException(_errorMessage(body, 'Failed to set nickname'));
  }
}