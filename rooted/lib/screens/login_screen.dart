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
      final data = (result['data'] as Map<String, dynamic>?) ?? {};
      final token = (data['token'] as Map<String, dynamic>?) ?? {};

      await SessionStorage.save(
        jwt: token['jwt']?.toString() ?? '',
        username: token['username']?.toString() ?? _usernameController.text.trim(),
        email: token['email']?.toString() ?? '',
        role: token['role']?.toString() ?? '',
      );
      if (mounted) {
        setState(() => _isLoading = false);
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => const HomeScreen(),
          ),
        );
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Login successful!'),
            backgroundColor: AppTheme.primary,
          ),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not reach the server. Please try again.'),
            backgroundColor: AppTheme.error,
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
              const SizedBox(height: 60),
              _buildHeader(),
              const SizedBox(height: 40),
              _buildForm(),
              const SizedBox(height: 12),
              _buildForgotPassword(),
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
        const Text(
          'Welcome back',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Sign in to continue to Rooted',
          style: TextStyle(
            fontSize: 15,
            color: AppTheme.textSecondary,
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

  Widget _buildForgotPassword() {
    return Align(
      alignment: Alignment.centerRight,
      child: TextButton(
        onPressed: () {
          // TODO: Navigate to forgot password screen
        },
        child: const Text('Forgot password?'),
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
        const Expanded(child: Divider(color: AppTheme.inputBorder)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'or',
            style: TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 13,
            ),
          ),
        ),
        const Expanded(child: Divider(color: AppTheme.inputBorder)),
      ],
    );
  }

  Widget _buildRegisterPrompt() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          "Don't have an account?",
          style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
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
