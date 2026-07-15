import 'package:flutter/material.dart';
import 'screens/welcome_screen.dart';
import 'screens/home_screen.dart';
import 'services/session_storage.dart';
import 'theme/app_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final jwt = await SessionStorage.getJwt();
  runApp(RootedApp(isLoggedIn: jwt != null));
}

class RootedApp extends StatelessWidget {
  final bool isLoggedIn;

  const RootedApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.theme,
      home: isLoggedIn ? const HomeScreen() : const WelcomeScreen(),
    );
  }
}
