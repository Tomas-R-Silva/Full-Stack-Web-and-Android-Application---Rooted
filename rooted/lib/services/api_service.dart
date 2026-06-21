import 'dart:convert';
import 'package:http/http.dart' as http;

/// Thrown when the backend returns a non-success response.
class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}

class ApiService {
  static const String baseUrl = 'https://adc-final.ey.r.appspot.com';

  /// Calls POST /createaccount.
  ///
  /// Mirrors UserResources.createAccount, which expects a User with
  /// username, password and role. The User entity stored server-side
  /// only has user_name/user_pwd/user_role/user_creation_time -- phone
  /// and address are NOT persisted at registration time (only via
  /// /modaccount later), so they're omitted here.
  static Future<Map<String, dynamic>> createAccount({
    required String username,
    required String password,
    String role = 'USER',
  }) async {
    final uri = Uri.parse('$baseUrl/createaccount');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {
          'username': username,
          'password': password,
          'role': role,
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
        'Registration failed (status ${response.statusCode})';
    throw ApiException(message);
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
    final uri = Uri.parse('$baseUrl/login');

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
    final uri = Uri.parse('$baseUrl/logout');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {'username': username},
        'token': {'jwt': jwt},
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
    final uri = Uri.parse('$baseUrl/deleteaccount');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {'username': username},
        'token': {'jwt': jwt},
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
  /// durationMinutes, maxAttendees and isPublic. Returns the new eventId.
  static Future<Map<String, dynamic>> createEvent({
    required String jwt,
    required String title,
    required String description,
    required String category,
    required String location,
    required int startDate,
    required int durationMinutes,
    required int maxAttendees,
    required bool isPublic,
  }) async {
    final uri = Uri.parse('$baseUrl/events/create');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'title': title,
        'description': description,
        'category': category,
        'location': location,
        'startDate': startDate,
        'durationMinutes': durationMinutes,
        'maxAttendees': maxAttendees,
        'isPublic': isPublic,
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
        'Event creation failed (status ${response.statusCode})';
    throw ApiException(message);
  }

  /// Calls POST /events/update.
  ///
  /// Mirrors EventResources.updateEvent. Only the organizer or an ADMIN
  /// may call this. Fields left null are left unchanged server-side.
  static Future<void> updateEvent({
    required String jwt,
    required String eventId,
    String? title,
    String? description,
    String? category,
    String? location,
    int? startDate,
    int? durationMinutes,
    int? maxAttendees,
    bool? isPublic,
  }) async {
    final uri = Uri.parse('$baseUrl/events/update');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'token': {'jwt': jwt},
        'eventId': eventId,
        if (title != null) 'title': title,
        if (description != null) 'description': description,
        if (category != null) 'category': category,
        if (location != null) 'location': location,
        if (startDate != null) 'startDate': startDate,
        if (durationMinutes != null) 'durationMinutes': durationMinutes,
        if (maxAttendees != null) 'maxAttendees': maxAttendees,
        if (isPublic != null) 'isPublic': isPublic,
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
    required String phone,
    required String address,
  }) async {
    final uri = Uri.parse('$baseUrl/modaccount');

    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'input': {
          'username': username,
          'attributes': {
            'phone': phone,
            'address': address,
          },
        },
        'token': {'jwt': jwt},
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
}
