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
          'role': role,
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
  /// 'FutureOr<Map<String, dynamic>>'".
  static Map<String, dynamic> _extractData(Map<String, dynamic> body) {
    final data = body['data'];
    if (data is Map<String, dynamic>) return data;
    return body;
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
      return _extractData(body);
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
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to list events'));
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
    required String eventId,
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
          'eventId': eventId,
          'text': text,
          'parentPostId': parentPostId,
        }..removeWhere((k, v) => v == null)
      }),
    );

    final body = _parseBody(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
    }

    throw ApiException(_errorMessage(body, 'Failed to post message'));
  }




  /// Calls POST /rest/forum/list.
  static Future<Map<String, dynamic>> listForumMessages({
    required String jwt,
    required String eventId,
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
          'eventId': eventId,
          'pageSize': pageSize,
          'cursor': cursor,
        }..removeWhere((k, v) => v == null)
      }),
    );
    final body = _parseBody(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return _extractData(body);
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
      return _extractData(body);
    }
    throw ApiException(_errorMessage(body, 'Failed to load user profile'));
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