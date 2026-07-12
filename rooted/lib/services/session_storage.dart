import 'package:shared_preferences/shared_preferences.dart';

/// Stores the logged-in user's session (JWT) on-device so it
/// survives app restarts.
class SessionStorage {
  static const _jwtKey = 'jwt';
  static const _usernameKey = 'username';
  static const _displayNameKey = 'display_name';
  static const _emailKey = 'email';
  static const _roleKey = 'role';
  static const _bioKey = 'bio';

  static Future<void> save({
    required String jwt,
    required String username,
    required String role,
    String displayName = '',
    String email = '',
    String bio = '',
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_jwtKey, jwt);
    await prefs.setString(_usernameKey, username);
    await prefs.setString(_displayNameKey, displayName.isEmpty ? username : displayName);
    await prefs.setString(_emailKey, email);
    await prefs.setString(_roleKey, role);
    await prefs.setString(_bioKey, bio);
  }

  static Future<String?> getJwt() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_jwtKey);
  }

  static Future<String?> getUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_usernameKey);
  }

  static Future<String?> getDisplayName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_displayNameKey);
  }

  static Future<String?> getEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_emailKey);
  }

  static Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_roleKey);
  }

  static Future<String?> getBio() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_bioKey);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_jwtKey);
    await prefs.remove(_usernameKey);
    await prefs.remove(_displayNameKey);
    await prefs.remove(_emailKey);
    await prefs.remove(_roleKey);
    await prefs.remove(_bioKey);
  }
}
