import 'dart:io';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/location_autocomplete.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';
import 'home_screen.dart';


class CreatePage extends StatefulWidget {
  const CreatePage({super.key});

  @override
  State<CreatePage> createState() => _CreatePageState();
}

class _CreatePageState extends State<CreatePage> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _attendeesController = TextEditingController();
  final TextEditingController _minAttendeesController = TextEditingController(text: '0');

  final TextEditingController _durationController = TextEditingController(text: '60');
  final TextEditingController _dateController = TextEditingController();
  final TextEditingController _timeController = TextEditingController();

  String _selectedCategory = 'Music';
  String? _selectedPlaceId;
  File? _eventImage;
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  bool _isPublic = true;
  bool _isAccessible = false;
  List<int> _selectedSDGs = [];
  bool _isSubmitting = false;
  String? _createdEventId;

  final List<String> _sdgLabels = [
    'No Poverty', 'Zero Hunger', 'Good Health', 'Quality Education',
    'Gender Equality', 'Clean Water', 'Affordable Energy', 'Decent Work',
    'Industry & Innovation', 'Reduced Inequalities', 'Sustainable Cities',
    'Responsible Consumption', 'Climate Action', 'Life Below Water',
    'Life on Land', 'Peace & Justice', 'Partnerships'
  ];

  final List<String> _categories = [
    'Music',
    'Sports',
    'Tech',
    'Food',
    'Art',
    'Business',
    'Community',
    'Other',
  ];

  final String _placesApiKey = 'AIzaSyAmYzNozAPQB27PHT4uP00qoBOg-cz7jdk';

  Future<void> _pickEventImage() async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (picked == null) return;

    // Copy out of the OS temp/cache dir into documents so it survives
    // long form-filling sessions where the cache might get cleared.
    final docsDir = await getApplicationDocumentsDirectory();
    final extension = picked.path.split('.').last;
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final savedImage = await File(picked.path).copy(
      '${docsDir.path}/event_image_draft_$timestamp.$extension',
    );

    // Delete the previous draft if the user swapped the image.
    final oldImage = _eventImage;
    if (oldImage != null && await oldImage.exists()) {
      await oldImage.delete();
    }

    setState(() => _eventImage = savedImage);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    _attendeesController.dispose();
    _minAttendeesController.dispose();
    _durationController.dispose();
    _dateController.dispose();
    _timeController.dispose();
    _eventImage?.delete().ignore();
    super.dispose();
  }

  Future<void> _submitEvent() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedDate == null || _selectedTime == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please pick a date and time')),
        );
      }
      return;
    }

    setState(() => _isSubmitting = true);

    final jwt = await SessionStorage.getJwt();
    if (jwt == null || jwt.isEmpty) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('You need to be logged in to create an event.')),
        );
      }
      return;
    }

    try {
      String eventId;
      if (_createdEventId == null) {
        final result = await ApiService.createEvent(
          jwt: jwt,
          username: await SessionStorage.getUsername(),
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          category: _selectedCategory.toUpperCase(),
          location: _locationController.text.trim(),
          startDate: DateTime(
            _selectedDate!.year, _selectedDate!.month, _selectedDate!.day,
            _selectedTime!.hour, _selectedTime!.minute,
          ).millisecondsSinceEpoch ~/ 1000,
          durationMinutes: int.tryParse(_durationController.text.trim()) ?? 60,
          maxAttendees: int.tryParse(_attendeesController.text.trim()) ?? 0,
          minAttendees: int.tryParse(_minAttendeesController.text.trim()) ?? 0,
          public: _isPublic,
          isAccessible: _isAccessible,
          sdg: _selectedSDGs,
        );
        eventId = (result['eventId'] ?? (result['data'] is Map ? result['data']['eventId'] : null) ?? result['id'] ?? '').toString();

        if (mounted) {
          setState(() {
            _createdEventId = eventId.isEmpty ? null : eventId;
          });
        }
      } else {
        eventId = _createdEventId!;
        await ApiService.updateEvent(
          jwt: jwt,
          eventId: eventId,
          username: await SessionStorage.getUsername(),
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          category: _selectedCategory.toUpperCase(),
          location: _locationController.text.trim(),
          startDate: DateTime(
            _selectedDate!.year, _selectedDate!.month, _selectedDate!.day,
            _selectedTime!.hour, _selectedTime!.minute,
          ).millisecondsSinceEpoch ~/ 1000,
          durationMinutes: int.tryParse(_durationController.text.trim()) ?? 60,
          maxAttendees: int.tryParse(_attendeesController.text.trim()) ?? 0,
          minAttendees: int.tryParse(_minAttendeesController.text.trim()) ?? 0,
          public: _isPublic,
          isAccessible: _isAccessible,
          sdg: _selectedSDGs,
        );
      }

      // Handle Image Upload if an image was picked
      if (_eventImage != null && eventId.isNotEmpty) {
        try {
          final bytes = await _eventImage!.readAsBytes();

          final base64String = base64Encode(bytes);
          final extension = _eventImage!.path.split('.').last.toLowerCase();
          final mimeType = extension == 'png' ? 'image/png' : 'image/jpeg';

          // Ensure exact spacing as requested by backend: "data:<mime>;base64,<data>"
          final dataUri = 'data:$mimeType;base64,$base64String';

          await ApiService.uploadEventImages(
            jwt: jwt,
            eventId: eventId,
            base64Images: [dataUri],
          );
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Event saved, but image upload failed: $e'),
                backgroundColor: Colors.orange,
              ),
            );
          }
        }
      }

      if (mounted) {
        setState(() => _isSubmitting = false);
        ApiService.notifyEventUpdate(eventId); // Refresh feeds
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_createdEventId == null
                ? 'Event created successfully!'
                : 'Event updated successfully!'),
          ),
        );
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppTheme.error),
        );
      }
    } catch (e) {
  debugPrint('CREATE EVENT ERROR: $e');
  if (mounted) {
  setState(() => _isSubmitting = false);
  ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(content: Text('Debug: $e'), backgroundColor: AppTheme.error),
  );
  }
  }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_createdEventId == null ? 'Create Event' : 'Edit Event'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        actions: [
          if (_createdEventId != null)
            TextButton(
              onPressed: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(builder: (_) => const HomeScreen(initialIndex: 0)),
                      (route) => false,
                );
              },
              child: const Text('Done', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              GestureDetector(
                onTap: _pickEventImage,
                child: Container(
                  height: 180,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(16),
                    image: _eventImage != null
                        ? DecorationImage(
                      image: FileImage(_eventImage!),
                      fit: BoxFit.cover,
                    )
                        : null,
                  ),
                  child: _eventImage == null
                      ? const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.add_a_photo, size: 40),
                      SizedBox(height: 8),
                      Text('Add Event Image'),
                    ],
                  )
                      : Align(
                    alignment: Alignment.bottomRight,
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: CircleAvatar(
                        radius: 18,
                        backgroundColor: Colors.black54,
                        child: const Icon(
                          Icons.edit,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Event Title',
                  border: OutlineInputBorder(),
                ),
                validator: (value) =>
                value!.isEmpty ? 'Enter a title' : null,
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                validator: (value) =>
                (value == null || value.trim().isEmpty) ? 'Enter a description' : null,
              ),

              const SizedBox(height: 16),

              DropdownButtonFormField<String>(
                initialValue: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'Category',
                  border: OutlineInputBorder(),
                ),
                items: _categories
                    .map(
                      (category) => DropdownMenuItem(
                    value: category,
                    child: Text(category),
                  ),
                )
                    .toList(),
                onChanged: (value) {
                  setState(() => _selectedCategory = value!);
                },
              ),

              const SizedBox(height: 16),

              LocationAutocomplete(
                apiKey: _placesApiKey,
                controller: _locationController,
                onPlaceSelected: (p) {
                  _locationController.text = p.description;
                  _selectedPlaceId = p.placeId; // add this field in the state
                },
              ),

              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    flex: 3,
                    child: TextFormField(
                      decoration: InputDecoration(
                        labelText: 'Date',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.calendar_today),
                      ),
                      controller: _dateController,
                      readOnly: true,
                      validator: (_) => _selectedDate == null ? 'Pick a date' : null,
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          firstDate: DateTime.now(),
                          lastDate: DateTime(2030),
                          initialDate: _selectedDate ?? DateTime.now(),
                        );
                        if (picked != null) {
                          setState(() => _selectedDate = picked);
                          _dateController.text =
                          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      decoration: InputDecoration(
                        labelText: 'Time',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.access_time_rounded),
                      ),
                      controller: _timeController,
                      readOnly: true,
                      validator: (_) => _selectedTime == null ? 'Pick a time' : null,
                      onTap: () async {
                        final picked = await showTimePicker(
                          context: context,
                          initialTime: _selectedTime ?? TimeOfDay.now(),
                        );
                        if (picked != null) {
                          setState(() => _selectedTime = picked);
                          _timeController.text =
                          '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}';
                        }
                      },
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _durationController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Duration (minutes)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.timer_outlined),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Enter a duration';
                  if (int.tryParse(value) == null) return 'Must be a number';
                  return null;
                },
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _attendeesController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Maximum Attendees',
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 16),

              TextFormField(
                controller: _minAttendeesController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Minimum Attendees',
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 16),

              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Public event'),
                subtitle: const Text('Anyone can find and join this event'),
                value: _isPublic,
                onChanged: (value) => setState(() => _isPublic = value),
              ),

              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Accessible event'),
                subtitle: const Text('This event is accessible for people with reduced mobility'),
                value: _isAccessible,
                onChanged: (value) => setState(() => _isAccessible = value),
              ),

              const SizedBox(height: 16),

              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Sustainability Goals (SDGs)',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: List.generate(17, (index) {
                  final sdgNum = index + 1;
                  final isSelected = _selectedSDGs.contains(sdgNum);
                  return FilterChip(
                    label: Text('SDG $sdgNum'),
                    tooltip: _sdgLabels[index],
                    selected: isSelected,
                    onSelected: (val) {
                      setState(() {
                        if (val) {
                          _selectedSDGs.add(sdgNum);
                        } else {
                          _selectedSDGs.remove(sdgNum);
                        }
                      });
                    },
                    selectedColor: AppTheme.primary.withValues(alpha: 0.2),
                    checkmarkColor: AppTheme.primary,
                  );
                }),
              ),

              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: _isSubmitting ? null : _submitEvent,
                  child: _isSubmitting
                      ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Colors.white,
                    ),
                  )
                      : Text(
                    _createdEventId == null ? 'Create Event' : 'Save Changes',
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}