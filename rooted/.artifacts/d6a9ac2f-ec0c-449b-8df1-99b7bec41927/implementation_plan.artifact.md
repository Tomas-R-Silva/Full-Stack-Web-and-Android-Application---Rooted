# Implementation Plan - Event Partner Management

Allow event organizers to invite other users to help organize an event as "Partners".

## User Review Required

> [!IMPORTANT]
> - The "Manage Partners" functionality will be restricted to the original event organizer and admins.
> - Partners are assumed to be a list of usernames associated with the event.
> - Adding a partner will be done via a username search/input in a bottom sheet.

## Proposed Changes

### [Component] Widgets

#### [NEW] [partners_bottom_sheet.dart](file:///home/efrra/ADC-Final/rooted/lib/widgets/partners_bottom_sheet.dart)
- Create a bottom sheet that:
    - Lists current partners (from `event['partners']` or a fetched list if available).
    - Provides a search/input field to add a new partner by username.
    - Shows a "Remove" button next to each existing partner.
    - Uses `ApiService.addPartner` and `ApiService.removePartner`.

### [Component] Screens

#### [MODIFY] [event_detail_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/event_detail_screen.dart)
- Add a "Manage Partners" button or a "Partners" row in the event details for organizers and admins.
- If partners exist, display them next to the organizer's name or in a dedicated section.
- Implement `_showPartners()` to open the `PartnersBottomSheet`.
- Refresh event data when partners are updated.

### [Component] Services

#### [MODIFY] [api_service.dart](file:///home/efrra/ADC-Final/rooted/lib/services/api_service.dart)
- Verify `_normalizeEvent` properly handles the `partners` field if it needs normalization (e.g., if it's a list of maps or strings).

## Verification Plan

### Manual Verification
1. Log in as an event organizer.
2. Go to your event's detail screen.
3. Click on "Manage Partners" (or the "Partners" section).
4. Enter a username of another user and click "Invite/Add".
5. Verify the user appears in the partners list.
6. Click "Remove" next to a partner and verify they are removed.
7. Log in as a regular user and verify you cannot see the "Manage Partners" button.
