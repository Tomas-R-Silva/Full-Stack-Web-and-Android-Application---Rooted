import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // Key is per-user so each account starts with a blank avatar and
  // their chosen picture doesn't bleed into another account's profile.
  String get _prefsKey => 'profile_image_path_$_username';

  File? _profileImage;
  bool _isLoadingImage = true;
  bool _isLoggingOut = false;
  bool _isDeletingAccount = false;
  bool _isSavingProfile = false;

  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  String _username = '';

  @override
  void initState() {
    super.initState();
    _loadSession();
  }

  Future<void> _loadSession() async {
    final username = await SessionStorage.getUsername();
    if (mounted && username != null) {
      setState(() => _username = username);
      // Load the image only after we know the username so the key is correct.
      await _loadSavedImage();
    } else {
      if (mounted) setState(() => _isLoadingImage = false);
    }
  }

  // Re-read whatever path we saved last time, so the picture is still
  // there the next time the user opens the app.
  Future<void> _loadSavedImage() async {
    final prefs = await SharedPreferences.getInstance();
    final savedPath = prefs.getString(_prefsKey);

    if (savedPath != null && await File(savedPath).exists()) {
      setState(() => _profileImage = File(savedPath));
    }
    if (mounted) setState(() => _isLoadingImage = false);
  }

  Future<void> _pickProfileImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (picked == null) return;

    // image_picker hands back a file in a temp/cache location that the OS
    // can wipe at any time. Copy it into this app's own documents folder
    // so the photo sticks around for good.
    //
    // The filename includes a timestamp on purpose: Flutter's image cache
    // keys a FileImage by its path, not its bytes. Reusing the same
    // filename would let the avatar keep showing the *old* picture even
    // after the file on disk was replaced.
    final docsDir = await getApplicationDocumentsDirectory();
    final extension = picked.path.split('.').last;
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final savedImage = await File(picked.path).copy(
      '${docsDir.path}/profile_picture_${_username}_$timestamp.$extension',
    );

    // Clean up the previous photo now that we have a new one.
    final oldImage = _profileImage;
    if (oldImage != null && await oldImage.exists()) {
      await oldImage.delete();
    }

    // Remember where we put it so we can reload it on the next launch.
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, savedImage.path);

    setState(() => _profileImage = savedImage);
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _handleSaveProfile() async {
    setState(() => _isSavingProfile = true);

    final jwt = await SessionStorage.getJwt();
    final username = _username.isNotEmpty ? _username : await SessionStorage.getUsername();

    if (jwt == null || username == null) {
      setState(() => _isSavingProfile = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('You need to be logged in to update your profile.')),
        );
      }
      return;
    }

    try {
      await ApiService.modifyAccount(
        jwt: jwt,
        username: username,
        phone: _phoneController.text.trim(),
        address: _addressController.text.trim(),
      );

      if (mounted) {
        setState(() => _isSavingProfile = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully!'),
            backgroundColor: AppTheme.primary,
          ),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _isSavingProfile = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppTheme.error),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isSavingProfile = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not reach the server. Please try again.'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  Future<void> _handleLogout() async {
    setState(() => _isLoggingOut = true);

    final username = await SessionStorage.getUsername();
    final jwt = await SessionStorage.getJwt();

    try {
      if (username != null && jwt != null) {
        await ApiService.logout(username: username, jwt: jwt);
      }
    } on ApiException catch (e) {
      // Even if the server call fails (e.g. session already expired),
      // we still want to clear the local session and send the user
      // back to login -- just let them know what happened.
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not reach the server. Logging out locally.'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }

    await SessionStorage.clear();

    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  Future<void> _handleDeleteAccount() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete account?'),
        content: const Text(
          'This permanently deletes your account and all of its data. '
          'This cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Delete',
              style: TextStyle(color: AppTheme.error),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isDeletingAccount = true);

    final username = await SessionStorage.getUsername();
    final jwt = await SessionStorage.getJwt();

    try {
      if (username == null || jwt == null) {
        throw ApiException('You are not logged in.');
      }
      await ApiService.deleteAccount(username: username, jwt: jwt);
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _isDeletingAccount = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: AppTheme.error,
          ),
        );
      }
      return;
    } catch (_) {
      if (mounted) {
        setState(() => _isDeletingAccount = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not reach the server. Please try again.'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
      return;
    }

    await SessionStorage.clear();

    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 60,
                  backgroundColor: Colors.grey.shade200,
                  backgroundImage:
                      _profileImage != null ? FileImage(_profileImage!) : null,
                  child: _profileImage == null && !_isLoadingImage
                      ? const Icon(Icons.person, size: 60, color: Colors.grey)
                      : null,
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: FloatingActionButton.small(
                    onPressed: _pickProfileImage,
                    child: const Icon(Icons.camera_alt),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            TextFormField(
              initialValue: _username.isEmpty ? null : _username,
              key: ValueKey(_username),
              enabled: false,
              decoration: const InputDecoration(labelText: 'Username'),
            ),

            const SizedBox(height: 16),

            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone'),
            ),

            const SizedBox(height: 16),

            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(labelText: 'Address'),
            ),

            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: _isSavingProfile ? null : _handleSaveProfile,
              child: _isSavingProfile
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2.5,
                      ),
                    )
                  : const Text('Save Changes'),
            ),

            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isLoggingOut ? null : _handleLogout,
                    icon: _isLoggingOut
                        ? const SizedBox(
                            height: 16,
                            width: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.logout_rounded, color: AppTheme.error),
                    label: Text(
                      _isLoggingOut ? 'Logging out...' : 'Log Out',
                      style: const TextStyle(color: AppTheme.error),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppTheme.error),
                      minimumSize: const Size.fromHeight(48),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isDeletingAccount ? null : _handleDeleteAccount,
                    icon: _isDeletingAccount
                        ? const SizedBox(
                            height: 16,
                            width: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.delete_forever_rounded),
                    label: Text(
                      _isDeletingAccount ? 'Deleting...' : 'Delete Account',
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.error,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(48),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
