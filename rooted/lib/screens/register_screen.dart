import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_text_field.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _displayName = TextEditingController();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  bool _acceptedTerms = false;
  final List<String> _selectedInterests = [];

  @override
  void dispose() {
    _displayName.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_acceptedTerms) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please accept the terms and conditions'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      debugPrint('Step 1: calling createAccount...');
      await ApiService.createAccount(
        username: _usernameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
        interests: _selectedInterests,
      );
      debugPrint('Step 1 OK: account created');

      // Small delay for eventual consistency in backend persistence
      await Future.delayed(const Duration(seconds: 1));

      // Auto-login so SessionStorage is populated before reaching HomeScreen
      debugPrint('Step 2: calling login...');
      final result = await ApiService.login(
        username: _usernameController.text.trim(),
        password: _passwordController.text,
      );
      debugPrint('Step 2 OK: login result = $result');

      final dataField = result['data'];
      final token = (result['token'] as Map<String, dynamic>?) ??
          (dataField is Map<String, dynamic> ? dataField['token'] as Map<String, dynamic>? : null) ?? {};

      if (token.isEmpty) {
        throw ApiException('Registration succeeded but login failed to return a session.');
      }

      final jwt = token['jwt']?.toString() ?? '';
      final username = token['username']?.toString() ?? _usernameController.text.trim();
      final role = token['role']?.toString() ?? '';
      debugPrint('Step 3: parsed jwt (len=${jwt.length}), username=$username, role=$role');

      // After login, fetch the full user account to be consistent with LoginScreen
      String bio = '';
      String email = token['email']?.toString() ?? _emailController.text.trim();
      String displayName = username;
      List<String> interests = _selectedInterests;
      String country = '';
      int birth = 0;
      List<int> ods = List.filled(17, 0);
      String borderId = '';
      int points = 0;
      try {
        debugPrint('Step 4: calling getUserAccount...');
        final profile = await ApiService.getUserAccount(jwt: jwt, username: username);
        debugPrint('Step 4 OK: profile = $profile');
        bio = profile['bio']?.toString() ?? '';
        email = profile['email']?.toString() ?? email;
        displayName = profile['display']?.toString() ?? username;
        interests = profile['category_list'] as List<String>? ?? interests;
        country = profile['country']?.toString() ?? '';
        birth = profile['birth'] as int? ?? 0;
        ods = (profile['ods'] as List?)?.cast<int>() ?? List.filled(17, 0);
        borderId = profile['borderID']?.toString() ?? '';
        points = profile['points'] as int? ?? 0;
      } catch (profileError) {
        debugPrint('Step 4 FAILED (non-fatal, using defaults): $profileError');
      }

      debugPrint('Step 5: saving session...');
      await SessionStorage.save(
        jwt: jwt,
        username: username,
        displayName: displayName,
        email: email,
        role: role,
        bio: bio,
        categories: interests,
        country: country,
        birth: birth,
        ods: ods,
        borderId: borderId,
        points: points,
      );
      debugPrint('Step 5 OK: session saved');

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
          const SnackBar(
            content: Text('Account created successfully!'),
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
      debugPrint('Registration flow failed: $e');
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
              const SizedBox(height: 16),
              _buildTopBar(context),
              const SizedBox(height: 32),
              _buildHeader(),
              const SizedBox(height: 32),
              _buildForm(),
              const SizedBox(height: 24),
              _buildInterestSelection(),
              const SizedBox(height: 24),
              _buildTermsCheckbox(),
              const SizedBox(height: 24),
              _buildRegisterButton(),
              const SizedBox(height: 32),
              _buildLoginPrompt(context),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar(BuildContext context) {
    return IconButton(
      onPressed: () => Navigator.pop(context),
      icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
      style: IconButton.styleFrom(
        backgroundColor: Colors.white,
        foregroundColor: AppTheme.textPrimary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.all(10),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Create account',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Join Rooted and start your journey',
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
            label: 'Full Name',
            hint: 'John Doe',
            prefixIcon: Icons.person_outline_rounded,
            controller: _displayName,
            keyboardType: TextInputType.name,
            validator: (value) {
              if (value == null || value.trim().isEmpty) return 'Name is required';
              if (value.trim().length < 2) return 'Name must be at least 2 characters';
              return null;
            },
          ),
          const SizedBox(height: 16),
          AuthTextField(
            label: 'Username',
            hint: 'john_doe',
            prefixIcon: Icons.alternate_email_rounded,
            controller: _usernameController,
            keyboardType: TextInputType.text,
            validator: (value) {
              if (value == null || value.trim().isEmpty) return 'Username is required';
              if (value.trim().length < 3) return 'Username must be at least 3 characters';
              if (value.trim().contains(' ')) return 'Username cannot contain spaces';
              return null;
            },
          ),
          const SizedBox(height: 16),
          AuthTextField(
            label: 'Email',
            hint: 'you@example.com',
            prefixIcon: Icons.email_outlined,
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.isEmpty) return 'Email is required';
              if (!RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                return 'Enter a valid email address';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          AuthTextField(
            label: 'Password',
            hint: 'Min. 6 characters',
            prefixIcon: Icons.lock_outline_rounded,
            controller: _passwordController,
            isPassword: true,
            validator: (value) {
              if (value == null || value.isEmpty) return 'Password is required';
              if (value.length < 6) return 'Password must be at least 6 characters';
              if (!RegExp(r'(?=.*[A-Z])').hasMatch(value)) {
                return 'Include at least one uppercase letter';
              }
              if (!RegExp(r'(?=.*[0-9])').hasMatch(value)) {
                return 'Include at least one number';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          AuthTextField(
            label: 'Confirm Password',
            hint: 'Repeat your password',
            prefixIcon: Icons.lock_outline_rounded,
            controller: _confirmPasswordController,
            isPassword: true,
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => _handleRegister(),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Please confirm your password';
              if (value != _passwordController.text) return 'Passwords do not match';
              return null;
            },
          ),
        ],
      ),
    );
  }

  Widget _buildInterestSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Your Interests',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Choose categories you like (you can change this later)',
          style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 16),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: ApiService.categories.map((category) {
            final isSelected = _selectedInterests.contains(category);
            return FilterChip(
              label: Text(category),
              selected: isSelected,
              onSelected: (val) {
                setState(() {
                  if (val) {
                    _selectedInterests.add(category);
                  } else {
                    _selectedInterests.remove(category);
                  }
                });
              },
              selectedColor: AppTheme.primary.withValues(alpha: 0.1),
              checkmarkColor: AppTheme.primary,
              labelStyle: TextStyle(
                color: isSelected ? AppTheme.primary : AppTheme.textSecondary,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(
                  color: isSelected ? AppTheme.primary : AppTheme.inputBorder,
                  width: 1,
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildTermsCheckbox() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: Checkbox(
            value: _acceptedTerms,
            activeColor: AppTheme.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
            onChanged: (val) => setState(() => _acceptedTerms = val ?? false),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: GestureDetector(
            onTap: () => setState(() => _acceptedTerms = !_acceptedTerms),
            child: RichText(
              text: TextSpan(
                style: const TextStyle(
                  fontSize: 13,
                  color: AppTheme.textSecondary,
                  height: 1.5,
                ),
                children: [
                  const TextSpan(text: 'I agree to the '),
                  TextSpan(
                    text: 'Terms of Service',
                    style: const TextStyle(
                      color: AppTheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const TextSpan(text: ' and '),
                  TextSpan(
                    text: 'Privacy Policy',
                    style: const TextStyle(
                      color: AppTheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRegisterButton() {
    return ElevatedButton(
      onPressed: _isLoading ? null : _handleRegister,
      child: _isLoading
          ? const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2.5,
              ),
            )
          : const Text('Create Account'),
    );
  }

  Widget _buildLoginPrompt(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          'Already have an account?',
          style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Sign In'),
        ),
      ],
    );
  }
}
