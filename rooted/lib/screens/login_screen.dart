import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_text_field.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'register_screen.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final result = await ApiService.login(
        username: _usernameController.text.trim(),
        password: _passwordController.text,
      );
      
      // Backend might return token at root or nested under data
      final dataField = result['data'];
      final token = (result['token'] as Map<String, dynamic>?) ?? 
                    (dataField is Map<String, dynamic> ? dataField['token'] as Map<String, dynamic>? : null) ?? {};

      if (token.isEmpty) {
        throw ApiException('Login failed to return a session.');
      }

      final jwt = token['jwt']?.toString() ?? '';
      if (jwt.isEmpty) {
        throw ApiException('Server did not provide a valid session token.');
      }
      final username = token['username']?.toString() ?? _usernameController.text.trim();
      final role = token['role']?.toString() ?? '';
      final expiresAt = token['expiresAt'];

      // After login, fetch the full user account to get the bio and latest email
      String bio = '';
      String email = token['email']?.toString() ?? '';
      String displayName = username;
      List<String> categories = [];
      String country = '';
      int birth = 0;
      List<int> ods = List.filled(17, 0);
      String borderId = '';
      int points = 0;
      try {
        final profile = await ApiService.getUserAccount(jwt: jwt, username: username, redirectOnError: false);
        bio = profile['bio']?.toString() ?? '';
        email = profile['email']?.toString() ?? email;
        displayName = profile['display']?.toString() ?? username;
        categories = profile['category_list'] as List<String>? ?? [];
        country = profile['country']?.toString() ?? '';
        birth = profile['birth'] as int? ?? 0;
        ods = (profile['ods'] as List?)?.cast<int>() ?? List.filled(17, 0);
        borderId = profile['borderID']?.toString() ?? '';
        points = profile['points'] as int? ?? 0;
      } catch (_) {
        // Fallback to defaults if profile fetch fails
      }

      await SessionStorage.save(
        jwt: jwt,
        username: username,
        displayName: displayName,
        email: email,
        role: role,
        bio: bio,
        categories: categories,
        country: country,
        birth: birth,
        ods: ods,
        borderId: borderId,
        points: points,
        expiresAt: ApiService.normalizeTimestamp(expiresAt),
      );
      if (mounted) {
        setState(() => _isLoading = false);
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (context) => const HomeScreen(),
          ),
          (route) => false,
        );
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Login successful!'),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Could not reach the server. Please try again.'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 80),
              _buildHeader(),
              const SizedBox(height: 40),
              _buildForm(),
              const SizedBox(height: 24),
              _buildLoginButton(),
              const SizedBox(height: 32),
              _buildDivider(),
              const SizedBox(height: 32),
              _buildRegisterPrompt(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Image.asset('assets/images/rooted.png', width: 160, height: 160),
        const SizedBox(height: 24),
        Text(
          'Welcome back',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).colorScheme.onSurface,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Sign in to continue to Rooted',
          style: TextStyle(
            fontSize: 15,
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildForm() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          AuthTextField(
            label: 'Username',
            hint: 'john_doe',
            prefixIcon: Icons.alternate_email_rounded,
            controller: _usernameController,
            keyboardType: TextInputType.text,
            validator: (value) {
              if (value == null || value.trim().isEmpty) return 'Username is required';
              return null;
            },
          ),
          const SizedBox(height: 16),
          AuthTextField(
            label: 'Password',
            hint: 'Your password',
            prefixIcon: Icons.lock_outline_rounded,
            controller: _passwordController,
            isPassword: true,
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => _handleLogin(),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Password is required';
              if (value.length < 6) return 'Password must be at least 6 characters';
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildLoginButton() {
    return ElevatedButton(
      onPressed: _isLoading ? null : _handleLogin,
      child: _isLoading
          ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2.5,
              ),
            )
          : const Text('Sign In'),
    );
  }

  Widget _buildDivider() {
    return Row(
      children: [
        Expanded(child: Divider(color: Theme.of(context).dividerColor)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'or',
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontSize: 13,
            ),
          ),
        ),
        Expanded(child: Divider(color: Theme.of(context).dividerColor)),
      ],
    );
  }

  Widget _buildRegisterPrompt() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Don't have an account?",
          style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant, fontSize: 14),
        ),
        TextButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const RegisterScreen()),
            );
          },
          child: const Text('Sign Up'),
        ),
      ],
    );
  }
}
