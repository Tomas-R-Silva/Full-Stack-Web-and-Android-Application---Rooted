import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  static const _prefsKey = 'profile_image_path';

  File? _profileImage;
  bool _isLoadingImage = true;

  @override
  void initState() {
    super.initState();
    _loadSavedImage();
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
      '${docsDir.path}/profile_picture_$timestamp.$extension',
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
              initialValue: 'John Doe',
              decoration: const InputDecoration(labelText: 'Name'),
            ),

            const SizedBox(height: 16),

            TextFormField(
              initialValue: 'john@email.com',
              decoration: const InputDecoration(labelText: 'Email'),
            ),

            const SizedBox(height: 16),

            TextFormField(
              initialValue: 'I love music and tech events.',
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Bio'),
            ),

            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: () {
                // Save profile
              },
              child: const Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }
}
