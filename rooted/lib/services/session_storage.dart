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
  static const _categoryKey = 'category';
  static const _countryKey = 'country';
  static const _birthKey = 'birth';
  static const _odsKey = 'ods';
  static const _borderIdKey = 'border_id';
  static const _pointsKey = 'points';

  static Future<void> save({
    required String jwt,
    required String username,
    required String role,
    String displayName = '',
    String email = '',
    String bio = '',
    List<String> categories = const [],
    String country = '',
    int birth = 0,
    List<int> ods = const [],
    String borderId = '',
    int points = 0,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_jwtKey, jwt);
    await prefs.setString(_usernameKey, username);
    await prefs.setString(_displayNameKey, displayName.isEmpty ? username : displayName);
    await prefs.setString(_emailKey, email);
    await prefs.setString(_roleKey, role);
    await prefs.setString(_bioKey, bio);
    await prefs.setStringList(_categoryKey, categories);
    await prefs.setString(_countryKey, country);
    await prefs.setInt(_birthKey, birth);
    await prefs.setStringList(_odsKey, ods.map((e) => e.toString()).toList());
    await prefs.setString(_borderIdKey, borderId);
    await prefs.setInt(_pointsKey, points);
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

  static Future<List<String>> getCategory() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_categoryKey) ?? [];
  }

  static Future<String?> getCountry() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_countryKey);
  }

  static Future<int?> getBirth() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_birthKey);
  }

  static Future<List<int>> getOds() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList(_odsKey);
    return list?.map((e) => int.parse(e)).toList() ?? List.filled(17, 0);
  }

  static Future<String?> getBorderId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_borderIdKey);
  }

  static Future<int?> getPoints() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_pointsKey);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_jwtKey);
    await prefs.remove(_usernameKey);
    await prefs.remove(_displayNameKey);
    await prefs.remove(_emailKey);
    await prefs.remove(_roleKey);
    await prefs.remove(_bioKey);
    await prefs.remove(_categoryKey);
    await prefs.remove(_countryKey);
    await prefs.remove(_birthKey);
    await prefs.remove(_odsKey);
    await prefs.remove(_borderIdKey);
    await prefs.remove(_pointsKey);
  }
}
