# Implementation Plan - Dedicated Progress Screen for All Users

Move the SDG progress information into a new, dedicated "Progress" screen accessible to every user, without altering existing administrative or business dashboards.

## User Review Required

> [!NOTE]
> The SDG breakdown will be moved from the main profile page into its own dashboard screen. A new "View My Progress" button will be added to the profile to access it.

## Proposed Changes

### [NEW] [progress_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/progress_screen.dart)
- Create a new `ProgressScreen` widget.
- Host the `ImpactSection` widget in this new screen.
- Include a user header (avatar, name, username) for context.

### [MODIFY] [profile_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/profile_screen.dart)
- Remove the embedded `ImpactSection` from the main profile scroll view.
- Add a standalone "View My Progress" button (using `ElevatedButton.icon`) above the "My Events" section.
- **Critical**: Do not change the existing Admin or Business dashboard buttons.

### [MODIFY] [user_profile_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/user_profile_screen.dart)
- Add a "View Progress" button to allow viewing the SDG achievements of other users.

## Verification Plan

### Manual Verification
1.  **Personal Progress**: Navigate to your profile and click "View My Progress". Verify all stats are correct.
2.  **Other User's Progress**: Navigate to another user's profile and click "View Progress". Verify you see their data.
3.  **UI Consistency**: Ensure the new button matches the app's button style and the new screen works well in both light and dark modes.
