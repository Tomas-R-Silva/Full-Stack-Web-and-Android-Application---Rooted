# Walkthrough - Event Partner Management

I have implemented the ability for event organizers and admins to manage co-organizers (Partners) for an event.

## Changes Made

### UI Components
- **[partners_bottom_sheet.dart](file:///home/efrra/ADC-Final/rooted/lib/widgets/partners_bottom_sheet.dart)**:
    - New widget for adding and removing partners by username.
    - Uses `ApiService.addPartner` and `ApiService.removePartner`.
- **[event_detail_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/event_detail_screen.dart)**:
    - Added a `_buildPartnersRow()` to display the list of current partners.
    - Added a "Manage" button for organizers and admins that opens the `PartnersBottomSheet`.
    - Partners' names are clickable and link to their profiles.

### Integration
- The system correctly identifies if the current user is the original organizer or an admin before showing management controls.
- Event data is automatically refreshed after adding or removing a partner.

## Verification Plan

### Manual Verification
1. Open an event you organized.
2. You should see a "Partners" section (showing "No partners yet" if empty) with a "Manage" button.
3. Click "Manage", enter a valid username, and click "Add".
4. Verify the user is added to the list.
5. Verify the user is now visible in the event details under the "Organised by" section.
6. Click "Remove" in the management sheet and verify they disappear.
