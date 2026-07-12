import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'screens/welcome_screen.dart';
import 'screens/home_screen.dart';
import 'services/session_storage.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
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
