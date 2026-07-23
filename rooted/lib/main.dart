import 'package:flutter/material.dart';
import 'screens/welcome_screen.dart';
import 'screens/home_screen.dart';
import 'services/session_storage.dart';
import 'services/api_service.dart';
import 'theme/app_theme.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await AppTheme.loadTheme(); // Load saved theme preference
  final jwt = await SessionStorage.getJwt();
  bool isLoggedIn = jwt != null;

  if (isLoggedIn) {
    if (await ApiService.isSessionExpired()) {
      await SessionStorage.clear();
      isLoggedIn = false;
    }
  }

  runApp(RootedApp(isLoggedIn: isLoggedIn));
}

class RootedApp extends StatelessWidget {
  final bool isLoggedIn;

  const RootedApp({super.key, required this.isLoggedIn});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: AppTheme.themeNotifier,
      builder: (_, ThemeMode currentMode, __) {
        return MaterialApp(
          navigatorKey: ApiService.navigatorKey,
          debugShowCheckedModeBanner: false,
          theme: AppTheme.theme,
          darkTheme: AppTheme.darkTheme,
          themeMode: currentMode,
          home: isLoggedIn ? const HomeScreen() : const WelcomeScreen(),
        );
      },
    );
  }
}
