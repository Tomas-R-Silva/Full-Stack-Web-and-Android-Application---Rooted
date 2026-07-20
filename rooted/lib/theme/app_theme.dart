import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppTheme {
  static const Color primary = Color(0xFF2D6A4F);
  static const Color primaryLight = Color(0xFF52B788);
  static const Color background = Color(0xFFF8F9FA);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surface = Colors.white;
  static const Color surfaceDark = Color(0xFF1E1E1E);
  static const Color textPrimary = Color(0xFF1B1B1B);
  static const Color textPrimaryDark = Color(0xFFF8F9FA);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textSecondaryDark = Color(0xFF9CA3AF);
  static const Color error = Color(0xFFDC2626);
  static const Color inputBorder = Color(0xFFE5E7EB);
  static const Color inputBorderDark = Color(0xFF374151);

  static final ValueNotifier<ThemeMode> themeNotifier = ValueNotifier(ThemeMode.light);

  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: primaryLight,
        primaryContainer: const Color(0xFFD8F3DC),
        onPrimaryContainer: primary,
        surface: background, // Scaffold background
        onSurface: textPrimary,
        surfaceContainer: Colors.white, // Standard cards/surfaces
        onSurfaceVariant: textSecondary,
        error: error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: background,
      fontFamily: 'SF Pro Display',

      // Typography
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: textPrimary, fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: -1),
        displayMedium: TextStyle(color: textPrimary, fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: -0.5),
        displaySmall: TextStyle(color: textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
        headlineMedium: TextStyle(color: textPrimary, fontSize: 20, fontWeight: FontWeight.w700),
        titleLarge: TextStyle(color: textPrimary, fontSize: 18, fontWeight: FontWeight.w700),
        titleMedium: TextStyle(color: textPrimary, fontSize: 16, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(color: textPrimary, fontSize: 16, height: 1.5),
        bodyMedium: TextStyle(color: textSecondary, fontSize: 14, height: 1.5),
        labelLarge: TextStyle(color: primary, fontSize: 14, fontWeight: FontWeight.bold),
      ),

      // AppBar
      appBarTheme: const AppBarTheme(
        backgroundColor: background,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
        ),
        iconTheme: IconThemeData(color: textPrimary, size: 22),
      ),

      // Cards
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: inputBorder.withOpacity(0.5), width: 1),
        ),
      ),

      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: inputBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: inputBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: error, width: 1.5),
        ),
        labelStyle: const TextStyle(color: textSecondary, fontWeight: FontWeight.w500),
        hintStyle: const TextStyle(color: textSecondary),
        floatingLabelStyle: const TextStyle(color: primary, fontWeight: FontWeight.w600),
      ),

      // Buttons
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
          elevation: 2,
          shadowColor: primary.withOpacity(0.4),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primary,
          side: const BorderSide(color: primary, width: 1.5),
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      // Other
      dividerTheme: DividerThemeData(
        thickness: 1,
        color: inputBorder.withOpacity(0.5),
        space: 24,
      ),

      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        elevation: 4,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: primaryLight,
        primaryContainer: const Color(0xFF1B4332),
        onPrimaryContainer: Colors.white,
        surface: backgroundDark, // Scaffold background
        onSurface: textPrimaryDark,
        surfaceContainer: surfaceDark, // Standard cards/surfaces
        onSurfaceVariant: textSecondaryDark,
        error: error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        brightness: Brightness.dark,
      ),
      scaffoldBackgroundColor: backgroundDark,
      fontFamily: 'SF Pro Display',

      // Typography
      textTheme: const TextTheme(
        displayLarge: TextStyle(color: textPrimaryDark, fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: -1),
        displayMedium: TextStyle(color: textPrimaryDark, fontSize: 28, fontWeight: FontWeight.bold, letterSpacing: -0.5),
        displaySmall: TextStyle(color: textPrimaryDark, fontSize: 24, fontWeight: FontWeight.bold),
        headlineMedium: TextStyle(color: textPrimaryDark, fontSize: 20, fontWeight: FontWeight.w700),
        titleLarge: TextStyle(color: textPrimaryDark, fontSize: 18, fontWeight: FontWeight.w700),
        titleMedium: TextStyle(color: textPrimaryDark, fontSize: 16, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(color: textPrimaryDark, fontSize: 16, height: 1.5),
        bodyMedium: TextStyle(color: textSecondaryDark, fontSize: 14, height: 1.5),
        labelLarge: TextStyle(color: primaryLight, fontSize: 14, fontWeight: FontWeight.bold),
      ),

      // AppBar
      appBarTheme: const AppBarTheme(
        backgroundColor: backgroundDark,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: textPrimaryDark,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
        ),
        iconTheme: IconThemeData(color: textPrimaryDark, size: 22),
      ),

      // Cards
      cardTheme: CardThemeData(
        color: surfaceDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(color: inputBorderDark.withOpacity(0.5), width: 1),
        ),
      ),

      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceDark,
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: inputBorderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: inputBorderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: primaryLight, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: error, width: 1.5),
        ),
        labelStyle: const TextStyle(color: textSecondaryDark, fontWeight: FontWeight.w500),
        hintStyle: const TextStyle(color: textSecondaryDark),
        floatingLabelStyle: const TextStyle(color: primaryLight, fontWeight: FontWeight.w600),
      ),

      // Buttons
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
          elevation: 2,
          shadowColor: Colors.black.withOpacity(0.4),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryLight,
          side: const BorderSide(color: primaryLight, width: 1.5),
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryLight,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),

      // Other
      dividerTheme: DividerThemeData(
        thickness: 1,
        color: inputBorderDark.withOpacity(0.5),
        space: 24,
      ),

      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        elevation: 4,
      ),
    );
  }

  static const String _themeKey = 'theme_mode';

  static Future<void> loadTheme() async {
    final prefs = await SharedPreferences.getInstance();
    final isDark = prefs.getBool(_themeKey) ?? false;
    themeNotifier.value = isDark ? ThemeMode.dark : ThemeMode.light;
  }

  static Future<void> toggleTheme(bool isDark) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_themeKey, isDark);
    themeNotifier.value = isDark ? ThemeMode.dark : ThemeMode.light;
  }
}
