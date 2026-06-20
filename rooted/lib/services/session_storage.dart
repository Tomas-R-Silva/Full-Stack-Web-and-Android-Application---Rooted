import 'package:shared_preferences/shared_preferences.dart';

/// Stores the logged-in user's session (JWT) on-device so it
/// survives app restarts.
class SessionStorage {
  static const _jwtKey = 'jwt';
  static const _usernameKey = 'username';
  static const _roleKey = 'role';

  static Future<void> save({
    required String jwt,
    required String username,
    required String role,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_jwtKey, jwt);
    await prefs.setString(_usernameKey, username);
    await prefs.setString(_roleKey, role);
  }

  static Future<String?> getJwt() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_jwtKey);
  }

  static Future<String?> getUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_usernameKey);
  }

  static Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_roleKey);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_jwtKey);
    await prefs.remove(_usernameKey);
    await prefs.remove(_roleKey);
  }
}
