import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/location_autocomplete.dart';
import '../services/api_service.dart';
import '../services/session_storage.dart';


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

  final TextEditingController _durationController = TextEditingController(text: '60');

  String _selectedCategory = 'Music';
  String? _selectedPlaceId;
  File? _eventImage;
  DateTime? _selectedDate;
  bool _isPublic = true;
  bool _isSubmitting = false;
  String? _createdEventId;

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
    _durationController.dispose();
    _eventImage?.delete().ignore();
    super.dispose();
  }

  Future<void> _submitEvent() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please pick a date')),
      );
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
      if (_createdEventId == null) {
        final result = await ApiService.createEvent(
          jwt: jwt,
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          category: _selectedCategory.toUpperCase(),
          location: _locationController.text.trim(),
          startDate: _selectedDate!.millisecondsSinceEpoch ~/ 1000,
          durationMinutes: int.tryParse(_durationController.text.trim()) ?? 60,
          maxAttendees: int.tryParse(_attendeesController.text.trim()) ?? 0,
          public: _isPublic,
        );

        if (mounted) {
          setState(() {
            _isSubmitting = false;
            _createdEventId = result['eventId']?.toString();
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Event created successfully!')),
          );
        }
      } else {
        await ApiService.updateEvent(
          jwt: jwt,
          eventId: _createdEventId!,
          title: _titleController.text.trim(),
          description: _descriptionController.text.trim(),
          category: _selectedCategory.toUpperCase(),
          location: _locationController.text.trim(),
          startDate: _selectedDate!.millisecondsSinceEpoch ~/ 1000,
          durationMinutes: int.tryParse(_durationController.text.trim()) ?? 60,
          maxAttendees: int.tryParse(_attendeesController.text.trim()) ?? 0,
          public: _isPublic,
        );

        if (mounted) {
          setState(() => _isSubmitting = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Event updated successfully!')),
          );
        }
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message), backgroundColor: AppTheme.error),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isSubmitting = false);
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
      appBar: AppBar(
        title: Text(_createdEventId == null ? 'Create Event' : 'Edit Event'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        actions: [
          if (_createdEventId != null)
            TextButton(
              onPressed: () => Navigator.pop(context),
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
                onPlaceSelected: (p) {
                  _locationController.text = p.description;
                  _selectedPlaceId = p.placeId; // add this field in the state
                },
              ),

              const SizedBox(height: 16),

              TextFormField(
                decoration: InputDecoration(
                  labelText: 'Date',
                  border: const OutlineInputBorder(),
                  prefixIcon: const Icon(Icons.calendar_today),
                  hintText: _selectedDate == null
                      ? null
                      : '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}',
                ),
                controller: TextEditingController(
                  text: _selectedDate == null
                      ? ''
                      : '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}',
                ),
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
                  }
                },
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

              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Public event'),
                subtitle: const Text('Anyone can find and join this event'),
                value: _isPublic,
                onChanged: (value) => setState(() => _isPublic = value),
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
