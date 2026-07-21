import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../theme/app_theme.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'event_detail_screen.dart';
import 'login_screen.dart';
import 'admin_screen.dart';
import 'bofficer_screen.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../data/borders_data.dart';
import '../models/border_item.dart';
import '../widgets/avatar_with_border.dart';
import '../widgets/impact_section.dart';
import '../widgets/country_autocomplete.dart';
import '../widgets/partner_mark.dart';
import 'progress_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String get _prefsKey => 'profile_image_path_$_username';

  File? _profileImage;
  bool _isLoadingImage = true;
  bool _isLoggingOut = false;
  bool _isDeletingAccount = false;

  String _username = '';
  String _displayName = '';
  String _email = '';
  String _role = '';
  String _bio = '';
  List<String> _categories = [];
  String _country = '';
  int _birth = 0;
  List<int> _ods = List.filled(17, 0);
  String _borderId = '';
  int _points = 0;
  String _avatarUrl = '';

  @override
  void initState() {
    super.initState();
    _loadSession();
  }

  Future<void> _loadSession() async {
    final username = await SessionStorage.getUsername();
    final display  = await SessionStorage.getDisplayName();
    final email    = await SessionStorage.getEmail();
    final role     = await SessionStorage.getRole();
    final bio      = await SessionStorage.getBio();
    final cats     = await SessionStorage.getCategory();
    final country  = await SessionStorage.getCountry();
    final birth    = await SessionStorage.getBirth();
    final ods      = await SessionStorage.getOds();
    final borderId = await SessionStorage.getBorderId();
    final points   = await SessionStorage.getPoints();

    if (mounted) {
      setState(() {
        _username    = username ?? '';
        _displayName = display  ?? '';
        _email       = email    ?? '';
        _role        = role     ?? '';
        _bio         = bio      ?? '';
        _categories  = cats;
        _country     = country  ?? '';
        _birth       = birth    ?? 0;
        _ods         = ods;
        _borderId    = borderId ?? '';
        _points      = points   ?? 0;
      });
      await _loadSavedImage();
      _fetchLatestProfile(); // Fetch fresh data from server
    } else {
      if (mounted) setState(() => _isLoadingImage = false);
    }
  }

  Future<void> _fetchLatestProfile() async {
    final jwt = await SessionStorage.getJwt();
    if (jwt == null || _username.isEmpty) return;

    try {
      final profile = await ApiService.getUserAccount(jwt: jwt, username: _username);
      if (mounted) {
        setState(() {
          _ods = (profile['ods'] as List?)?.cast<int>() ?? _ods;
          _points = profile['points'] as int? ?? _points;
          _borderId = profile['borderID']?.toString() ?? _borderId;
          _avatarUrl = profile['avatar_url']?.toString() ?? '';
        });

        // Update SessionStorage with latest data
        await SessionStorage.save(
          jwt: jwt,
          username: _username,
          role: _role,
          displayName: _displayName,
          email: _email,
          bio: _bio,
          categories: _categories,
          country: _country,
          birth: _birth,
          ods: _ods,
          borderId: _borderId,
          points: _points,
        );
      }
    } catch (_) {}
  }

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
    final picked = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked == null) return;

    final docsDir   = await getApplicationDocumentsDirectory();
    final extension = picked.path.split('.').last;
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final savedImage = await File(picked.path).copy(
      '${docsDir.path}/profile_picture_${_username}_$timestamp.$extension',
    );

    final oldImage = _profileImage;
    if (oldImage != null && await oldImage.exists()) await oldImage.delete();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, savedImage.path);

    setState(() => _profileImage = savedImage);

    // Upload to server
    final jwt = await SessionStorage.getJwt();
    if (jwt != null) {
      try {
        final bytes = await savedImage.readAsBytes();
        final base64Image = base64Encode(bytes);
        final mimeType = extension == 'png' ? 'image/png' : 'image/jpeg';
        final dataUri = 'data:$mimeType;base64,$base64Image';

        await ApiService.modifyAccount(
          jwt: jwt,
          username: _username,
          email: _email,
          avatar: dataUri,
        );
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to upload profile picture: $e')),
          );
        }
      }
    }
  }

  // ── Edit profile bottom sheet ─────────────────────────────────────────────

  void _openEditProfile() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _EditProfileSheet(
        username: _username,
        displayName: _displayName,
        email: _email,
        bio: _bio,
        categories: _categories,
        country: _country,
        birth: _birth,
        onSaved: () {
          _loadSession(); // reload data after saving
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Profile updated successfully!'),
                backgroundColor: Theme.of(context).colorScheme.primary,
              ),
            );
          }
        },
      ),
    );
  }

  // ── Logout / Delete ───────────────────────────────────────────────────────

  Future<void> _handleLogout() async {
    setState(() => _isLoggingOut = true);
    final username = await SessionStorage.getUsername();
    final jwt      = await SessionStorage.getJwt();
    try {
      if (username != null && jwt != null) {
        await ApiService.logout(username: username, jwt: jwt);
      }
    } catch (_) {}

    if (mounted) {
      await ApiService.forceLogout();
    }
  }

  void _showBorderPicker() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            const SizedBox(height: 12),
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Choose Profile Border',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Total Points: $_points',
              style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                padding: const EdgeInsets.all(20),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.8,
                ),
                itemCount: BordersData.allBorders.length + 1, // +1 for "No Border"
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return _buildBorderOption(null, true);
                  }
                  final border = BordersData.allBorders[index - 1];
                  final unlocked = BordersData.isUnlocked(border, _ods, _points);
                  return _buildBorderOption(border, unlocked);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBorderOption(BorderItem? border, bool unlocked) {
    final isSelected = (border?.id ?? '') == _borderId;

    return GestureDetector(
      onTap: unlocked ? () => _selectBorder(border?.id ?? '') : null,
      child: Column(
        children: [
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: isSelected
                        ? Border.all(color: Theme.of(context).colorScheme.primary, width: 3)
                        : null,
                  ),
                  child: Opacity(
                    opacity: unlocked ? 1.0 : 0.4,
                    child: AvatarWithBorder(
                      borderId: border?.id,
                      imageFile: _profileImage,
                      imageUrl: _avatarUrl,
                      radius: 30,
                    ),
                  ),
                ),
                if (!unlocked)
                  const Icon(Icons.lock_outline, color: Colors.white, size: 24),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            border?.name ?? 'None',
            style: TextStyle(
              fontSize: 10,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: unlocked ? Theme.of(context).colorScheme.onSurface : Colors.grey,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          if (border != null)
            Text(
              '${border.value} ${border.valueType}',
              style: TextStyle(
                fontSize: 8,
                color: unlocked ? Theme.of(context).colorScheme.primary : Colors.grey.shade400,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
        ],
      ),
    );
  }

  Future<void> _selectBorder(String borderId) async {
    final jwt = await SessionStorage.getJwt();
    if (jwt == null) return;

    try {
      await ApiService.changeBorder(jwt: jwt, borderID: borderId);

      // Update local storage
      final username = await SessionStorage.getUsername();
      final role = await SessionStorage.getRole();
      final display = await SessionStorage.getDisplayName();
      final email = await SessionStorage.getEmail();
      final bio = await SessionStorage.getBio();
      final cats = await SessionStorage.getCategory();
      final country = await SessionStorage.getCountry();
      final birth = await SessionStorage.getBirth();
      final ods = await SessionStorage.getOds();
      final points = await SessionStorage.getPoints();

      await SessionStorage.save(
        jwt: jwt,
        username: username ?? '',
        role: role ?? '',
        displayName: display ?? '',
        email: email ?? '',
        bio: bio ?? '',
        categories: cats,
        country: country ?? '',
        birth: birth ?? 0,
        ods: ods,
        borderId: borderId,
        points: points ?? 0,
      );

      if (mounted) {
        setState(() => _borderId = borderId);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Border updated!'),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update border: $e'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
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
            child: Text('Delete', style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    setState(() => _isDeletingAccount = true);
    final username = await SessionStorage.getUsername();
    final jwt      = await SessionStorage.getJwt();
    try {
      if (username == null || jwt == null) throw ApiException('You are not logged in.');
      await ApiService.deleteAccount(username: username, jwt: jwt);
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _isDeletingAccount = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
      return;
    } catch (_) {
      if (mounted) {
        setState(() => _isDeletingAccount = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Could not reach the server. Please try again.'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
      return;
    }
    await SessionStorage.clear();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
            (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_username.isEmpty && !_isLoadingImage) {
      return Scaffold(
        appBar: AppBar(title: const Text('Profile')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.person_outline, size: 80, color: Colors.grey),
              const SizedBox(height: 24),
              const Text(
                'You are browsing as a guest',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Login to manage your profile and events.',
                style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
              ),
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                        (route) => false,
                  );
                },
                child: const Text('Login / Sign Up'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Avatar
            Stack(
              children: [
                GestureDetector(
                  onTap: _showBorderPicker,
                  child: AvatarWithBorder(
                    borderId: _borderId,
                    imageFile: _profileImage,
                    imageUrl: _avatarUrl,
                    radius: 60,
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: FloatingActionButton.small(
                    heroTag: 'camera_fab',
                    onPressed: _pickProfileImage,
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                    child: const Icon(Icons.camera_alt, size: 18),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Username + role badge
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  _displayName.isEmpty ? '—' : _displayName,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary, // Changed to a more consistent style if needed, but keeping original theme if possible
                  ),
                ),
                PartnerMark(role: _role, size: 20),
              ],
            ),
            if (_role.isNotEmpty) ...[
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _role,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Theme.of(context).colorScheme.primary,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],

            const SizedBox(height: 32),

            // Info cards
            _InfoCard(children: [
              _InfoRow(icon: Icons.alternate_email_rounded, label: 'Username', value: _username),
              const Divider(height: 1),
              _InfoRow(icon: Icons.email_outlined, label: 'Email', value: _email.isEmpty ? '—' : _email),
              const Divider(height: 1),
              _InfoRow(icon: Icons.info_outline, label: 'Bio', value: _bio.isEmpty ? 'No bio provided' : _bio),
              const Divider(height: 1),
              _InfoRow(
                icon: Icons.category_outlined,
                label: 'Interests',
                value: _categories.isEmpty ? '—' : _categories.join(', '),
              ),
              const Divider(height: 1),
              _InfoRow(icon: Icons.public_outlined, label: 'Country', value: _country.isEmpty ? '—' : _country),
            ]),

            const SizedBox(height: 24),

            // Settings Card
            _InfoCard(children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    Icon(Icons.dark_mode_outlined, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Dark Mode',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    ValueListenableBuilder<ThemeMode>(
                      valueListenable: AppTheme.themeNotifier,
                      builder: (context, mode, child) {
                        return Switch(
                          value: mode == ThemeMode.dark,
                          onChanged: (val) => AppTheme.toggleTheme(val),
                          activeThumbColor: Theme.of(context).colorScheme.primary,
                        );
                      },
                    ),
                  ],
                ),
              ),
            ]),

            const SizedBox(height: 24),

            // Edit profile button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _openEditProfile,
                icon: const Icon(Icons.edit_outlined, size: 18),
                label: const Text('Edit Profile'),
              ),
            ),

            if (_role == 'ADMIN') ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const AdminScreen()),
                  ),
                  icon: const Icon(Icons.admin_panel_settings_outlined, size: 18),
                  label: const Text('Admin Dashboard'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],

            if (_role == 'BOFFICER') ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const BusinessOfficerScreen()),
                  ),
                  icon: const Icon(Icons.business_center_outlined, size: 18),
                  label: const Text('Business Dashboard'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ProgressScreen(
                      username: _username,
                      displayName: _displayName,
                      avatarUrl: _avatarUrl,
                      borderId: _borderId,
                      points: _points,
                      ods: _ods,
                    ),
                  ),
                ),
                icon: const Icon(Icons.auto_graph_rounded, size: 18),
                label: const Text('View My Progress'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                  foregroundColor: Theme.of(context).colorScheme.onPrimaryContainer,
                ),
              ),
            ),

            const SizedBox(height: 32),

            // User's Events Section
            _buildMyEventsSection(),

            const SizedBox(height: 24),

            // Logout / Delete
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isLoggingOut ? null : _handleLogout,
                    icon: _isLoggingOut
                        ? const SizedBox(
                        height: 16, width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2))
                        : Icon(Icons.logout_rounded, color: Theme.of(context).colorScheme.error),
                    label: Text(
                      _isLoggingOut ? 'Logging out…' : 'Log Out',
                      style: TextStyle(color: Theme.of(context).colorScheme.error),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Theme.of(context).colorScheme.error),
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
                        height: 16, width: 16,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.delete_forever_rounded),
                    label: Text(_isDeletingAccount ? 'Deleting…' : 'Delete Account'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.error,
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
  Widget _buildMyEventsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 8),
          child: Text(
            'My Events',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        FutureBuilder<Map<String, dynamic>>(
          future: ApiService.listEvents(
            organizerUsername: _username,
            status: 'UPCOMING',
          ),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.hasError) {
              return const Text('Error loading your events');
            }
            final data = snapshot.data?['data'] ?? snapshot.data ?? {};
            final events = (data['events'] as List<dynamic>? ?? []).cast<Map<String, dynamic>>();

            if (events.isEmpty) {
              return Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceContainer,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Theme.of(context).dividerColor),
                ),
                child: Center(
                  child: Text(
                    'You haven\'t created any events yet.',
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
                  ),
                ),
              );
            }

            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: events.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final event = events[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  tileColor: Theme.of(context).colorScheme.surfaceContainer,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Theme.of(context).dividerColor),
                  ),
                  title: Text(
                    event['title'] ?? 'Untitled',
                    style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface),
                  ),
                  subtitle: Text(
                    event['location'] ?? 'No location',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Theme.of(context).colorScheme.onSurfaceVariant),
                  ),
                  trailing: Icon(Icons.chevron_right, color: Theme.of(context).colorScheme.onSurfaceVariant),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => EventDetailScreen(event: event),
                      ),
                    );
                  },
                );
              },
            );
          },
        ),
      ],
    );
  }
}

// ── Edit Profile bottom sheet ─────────────────────────────────────────────────

class _EditProfileSheet extends StatefulWidget {
  final String username;
  final String displayName;
  final String email;
  final String bio;
  final List<String> categories;
  final String country;
  final int birth;
  final VoidCallback onSaved;

  const _EditProfileSheet({
    required this.username,
    required this.displayName,
    required this.email,
    required this.bio,
    required this.categories,
    required this.country,
    required this.birth,
    required this.onSaved,
  });

  @override
  State<_EditProfileSheet> createState() => _EditProfileSheetState();
}

class _EditProfileSheetState extends State<_EditProfileSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _displayController;
  late final TextEditingController _emailController;
  late final TextEditingController _bioController;
  late final List<String> _selectedCategories;
  late final TextEditingController _countryController;
  late int _birth;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _displayController = TextEditingController(text: widget.displayName);
    _emailController = TextEditingController(text: widget.email);
    _bioController = TextEditingController(text: widget.bio);
    _selectedCategories = List.from(widget.categories);
    _countryController = TextEditingController(text: widget.country);
    _birth = widget.birth;
  }

  @override
  void dispose() {
    _displayController.dispose();
    _emailController.dispose();
    _bioController.dispose();
    _countryController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final jwt = await SessionStorage.getJwt();
    final role = await SessionStorage.getRole();
    if (jwt == null) {
      setState(() => _isSaving = false);
      return;
    }

    try {
      final newDisplayName = _displayController.text.trim();
      final newEmail = _emailController.text.trim();
      final newBio = _bioController.text.trim();
      final newCountry = _countryController.text.trim();

      await ApiService.modifyAccount(
        jwt: jwt,
        username: widget.username,
        displayName: newDisplayName,
        email: newEmail,
        bio: newBio,
        categories: _selectedCategories,
        country: newCountry,
        birth: _birth,
      );

      // Fetch current additional data to avoid overwriting with defaults
      final currentOds = await SessionStorage.getOds();
      final currentBorder = await SessionStorage.getBorderId();
      final currentPoints = await SessionStorage.getPoints();

      // Persist changes locally so they are visible immediately
      await SessionStorage.save(
        jwt: jwt,
        username: widget.username,
        displayName: newDisplayName,
        email: newEmail,
        role: role ?? '',
        bio: newBio,
        categories: _selectedCategories,
        country: newCountry,
        birth: _birth,
        ods: currentOds,
        borderId: currentBorder ?? '',
        points: currentPoints ?? 0,
      );

      if (mounted) {
        Navigator.pop(context);
        widget.onSaved();
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isSaving = false);
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
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(24, 24, 24, 24 + bottomInset),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          Text(
            'Edit Profile',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Update your profile information.',
            style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurfaceVariant),
          ),
          const SizedBox(height: 24),

          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _displayController,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Display Name',
                    prefixIcon: Icon(Icons.person_outline_rounded, size: 20),
                  ),
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? 'Display name is required'
                      : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.done,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email_outlined, size: 20),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Email is required';
                    if (!RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(v)) {
                      return 'Enter a valid email address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _bioController,
                  maxLines: 3,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    labelText: 'Bio',
                    prefixIcon: Icon(Icons.info_outline_rounded, size: 20),
                    hintText: 'Tell us a bit about yourself...',
                  ),
                ),
                const SizedBox(height: 16),
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Interests',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: ApiService.categories.map((category) {
                    final isSelected = _selectedCategories.contains(category);
                    return FilterChip(
                      label: Text(category),
                      selected: isSelected,
                      onSelected: (val) {
                        setState(() {
                          if (val) {
                            _selectedCategories.add(category);
                          } else {
                            _selectedCategories.remove(category);
                          }
                        });
                      },
                      selectedColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                      checkmarkColor: Theme.of(context).colorScheme.primary,
                      labelStyle: TextStyle(
                        fontSize: 13,
                        color: isSelected ? Theme.of(context).colorScheme.primary : Theme.of(context).colorScheme.onSurfaceVariant,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: BorderSide(
                          color: isSelected ? Theme.of(context).colorScheme.primary : Theme.of(context).dividerColor,
                          width: 1,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),
                CountryAutocomplete(
                  apiKey: dotenv.env['MAPS_API_KEY'] ?? '',
                  controller: _countryController,
                  onCountrySelected: (val) {
                    _countryController.text = val;
                  },
                ),
                const SizedBox(height: 16),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.calendar_today_outlined),
                  title: const Text('Birth Date'),
                  subtitle: Text(_birth == 0
                      ? 'Not set'
                      : DateTime.fromMillisecondsSinceEpoch(_birth * 1000)
                      .toLocal()
                      .toString()
                      .split(' ')[0]),
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _birth == 0
                          ? DateTime(2000)
                          : DateTime.fromMillisecondsSinceEpoch(_birth * 1000),
                      firstDate: DateTime(1900),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) {
                      setState(() =>
                      _birth = picked.millisecondsSinceEpoch ~/ 1000);
                    }
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isSaving ? null : () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _save,
                  child: _isSaving
                      ? const SizedBox(
                      height: 20, width: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2.5))
                      : const Text('Save'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Small reusable widgets ────────────────────────────────────────────────────

class _InfoCard extends StatelessWidget {
  final List<Widget> children;
  const _InfoCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainer,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(children: children),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 11,
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(value,
                    style: TextStyle(
                        fontSize: 15,
                        color: Theme.of(context).colorScheme.onSurface,
                        fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}