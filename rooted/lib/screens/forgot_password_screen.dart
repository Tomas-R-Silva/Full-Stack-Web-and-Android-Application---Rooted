import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_text_field.dart';

enum _Step { email, code, newPassword, done }

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  _Step _step = _Step.email;
  bool _isLoading = false;

  // Controllers
  final _emailController    = TextEditingController();
  final _codeController     = TextEditingController();
  final _newPwdController   = TextEditingController();
  final _confirmPwdController = TextEditingController();

  // Form keys per step
  final _emailFormKey  = GlobalKey<FormState>();
  final _codeFormKey   = GlobalKey<FormState>();
  final _pwdFormKey    = GlobalKey<FormState>();

  @override
  void dispose() {
    _emailController.dispose();
    _codeController.dispose();
    _newPwdController.dispose();
    _confirmPwdController.dispose();
    super.dispose();
  }

  // ── Step handlers ─────────────────────────────────────────────────────────

  Future<void> _sendCode() async {
    if (!_emailFormKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    await Future.delayed(const Duration(seconds: 1)); // TODO: ApiService.sendPasswordResetCode(email: ...)

    if (mounted) {
      setState(() {
        _isLoading = false;
        _step = _Step.code;
      });
    }
  }

  Future<void> _verifyCode() async {
    if (!_codeFormKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    await Future.delayed(const Duration(seconds: 1)); // TODO: ApiService.verifyPasswordResetCode(email: ..., code: ...)

    if (mounted) {
      setState(() {
        _isLoading = false;
        _step = _Step.newPassword;
      });
    }
  }

  Future<void> _resetPassword() async {
    if (!_pwdFormKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    await Future.delayed(const Duration(seconds: 1)); // TODO: ApiService.resetPassword(email: ..., code: ..., newPassword: ...)

    if (mounted) {
      setState(() {
        _isLoading = false;
        _step = _Step.done;
      });
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: _step == _Step.done
            ? const SizedBox.shrink()
            : BackButton(color: AppTheme.textPrimary),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            transitionBuilder: (child, animation) => FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0.06, 0),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              ),
            ),
            child: _buildStep(),
          ),
        ),
      ),
    );
  }

  Widget _buildStep() {
    switch (_step) {
      case _Step.email:
        return _EmailStep(
          key: const ValueKey('email'),
          formKey: _emailFormKey,
          controller: _emailController,
          isLoading: _isLoading,
          onSubmit: _sendCode,
        );
      case _Step.code:
        return _CodeStep(
          key: const ValueKey('code'),
          formKey: _codeFormKey,
          controller: _codeController,
          email: _emailController.text.trim(),
          isLoading: _isLoading,
          onSubmit: _verifyCode,
          onResend: () {
            setState(() => _step = _Step.email);
          },
        );
      case _Step.newPassword:
        return _NewPasswordStep(
          key: const ValueKey('newPassword'),
          formKey: _pwdFormKey,
          newPwdController: _newPwdController,
          confirmPwdController: _confirmPwdController,
          isLoading: _isLoading,
          onSubmit: _resetPassword,
        );
      case _Step.done:
        return _DoneStep(
          key: const ValueKey('done'),
          onBackToLogin: () => Navigator.of(context).pop(),
        );
    }
  }
}

// ── Step widgets ─────────────────────────────────────────────────────────────

class _EmailStep extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController controller;
  final bool isLoading;
  final VoidCallback onSubmit;

  const _EmailStep({
    super.key,
    required this.formKey,
    required this.controller,
    required this.isLoading,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 12),
        _StepIcon(icon: Icons.lock_reset_rounded),
        const SizedBox(height: 28),
        const Text('Forgot password?',
            style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
                letterSpacing: -0.5)),
        const SizedBox(height: 8),
        const Text(
          "Enter your email and we'll send you a recovery code.",
          style: TextStyle(fontSize: 15, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 32),
        Form(
          key: formKey,
          child: AuthTextField(
            label: 'Email address',
            hint: 'john@example.com',
            prefixIcon: Icons.email_outlined,
            controller: controller,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => onSubmit(),
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Enter your email';
              if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(v.trim()))
                return 'Enter a valid email';
              return null;
            },
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: isLoading ? null : onSubmit,
          child: isLoading ? _Spinner() : const Text('Send Recovery Code'),
        ),
      ],
    );
  }
}

class _CodeStep extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController controller;
  final String email;
  final bool isLoading;
  final VoidCallback onSubmit;
  final VoidCallback onResend;

  const _CodeStep({
    super.key,
    required this.formKey,
    required this.controller,
    required this.email,
    required this.isLoading,
    required this.onSubmit,
    required this.onResend,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 12),
        _StepIcon(icon: Icons.mark_email_read_outlined),
        const SizedBox(height: 28),
        const Text('Check your email',
            style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
                letterSpacing: -0.5)),
        const SizedBox(height: 8),
        Text(
          'We sent a 6-digit code to $email',
          style: const TextStyle(fontSize: 15, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 32),
        Form(
          key: formKey,
          child: AuthTextField(
            label: 'Recovery code',
            hint: '000000',
            prefixIcon: Icons.pin_outlined,
            controller: controller,
            keyboardType: TextInputType.number,
            textInputAction: TextInputAction.done,
            onFieldSubmitted: (_) => onSubmit(),
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Enter the code';
              if (v.trim().length != 6) return 'Code must be 6 digits';
              if (int.tryParse(v.trim()) == null) return 'Code must be numeric';
              return null;
            },
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: isLoading ? null : onSubmit,
          child: isLoading ? _Spinner() : const Text('Verify Code'),
        ),
        const SizedBox(height: 16),
        Center(
          child: TextButton(
            onPressed: onResend,
            child: const Text("Didn't receive it? Try again"),
          ),
        ),
      ],
    );
  }
}

class _NewPasswordStep extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController newPwdController;
  final TextEditingController confirmPwdController;
  final bool isLoading;
  final VoidCallback onSubmit;

  const _NewPasswordStep({
    super.key,
    required this.formKey,
    required this.newPwdController,
    required this.confirmPwdController,
    required this.isLoading,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 12),
        _StepIcon(icon: Icons.lock_outline_rounded),
        const SizedBox(height: 28),
        const Text('New password',
            style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
                letterSpacing: -0.5)),
        const SizedBox(height: 8),
        const Text(
          'Choose a strong password you haven\'t used before.',
          style: TextStyle(fontSize: 15, color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 32),
        Form(
          key: formKey,
          child: Column(
            children: [
              AuthTextField(
                label: 'New password',
                hint: 'At least 6 characters',
                prefixIcon: Icons.lock_outline_rounded,
                controller: newPwdController,
                isPassword: true,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Enter a password';
                  if (v.length < 6) return 'Password must be at least 6 characters';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              AuthTextField(
                label: 'Confirm password',
                hint: 'Repeat your password',
                prefixIcon: Icons.lock_outline_rounded,
                controller: confirmPwdController,
                isPassword: true,
                textInputAction: TextInputAction.done,
                onFieldSubmitted: (_) => onSubmit(),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Confirm your password';
                  if (v != newPwdController.text) return 'Passwords do not match';
                  return null;
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: isLoading ? null : onSubmit,
          child: isLoading ? _Spinner() : const Text('Reset Password'),
        ),
      ],
    );
  }
}

class _DoneStep extends StatelessWidget {
  final VoidCallback onBackToLogin;

  const _DoneStep({super.key, required this.onBackToLogin});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 60),
        Container(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            color: AppTheme.primary.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check_circle_outline_rounded,
              size: 48, color: AppTheme.primary),
        ),
        const SizedBox(height: 28),
        const Text('Password reset!',
            style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary,
                letterSpacing: -0.5)),
        const SizedBox(height: 8),
        const Text(
          'Your password has been updated.\nYou can now sign in with your new password.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 15, color: AppTheme.textSecondary, height: 1.5),
        ),
        const SizedBox(height: 40),
        ElevatedButton(
          onPressed: onBackToLogin,
          child: const Text('Back to Sign In'),
        ),
      ],
    );
  }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

class _StepIcon extends StatelessWidget {
  final IconData icon;
  const _StepIcon({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: AppTheme.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Icon(icon, color: AppTheme.primary, size: 28),
    );
  }
}

class _Spinner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      width: 20,
      height: 20,
      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
    );
  }
}
