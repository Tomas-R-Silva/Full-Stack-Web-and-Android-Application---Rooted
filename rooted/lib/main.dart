import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'theme/app_theme.dart';

void main() => runApp(const RootedApp());

class RootedApp extends StatelessWidget {
  const RootedApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: const LoginScreen(),
    );
  }
}
