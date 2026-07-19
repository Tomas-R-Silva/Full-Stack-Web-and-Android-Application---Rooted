# Dark Mode Implementation Plan

Add support for dark mode with a persistent toggle in the Profile screen.

## User Review Required

> [!NOTE]
> I will implement a global `themeNotifier` in `AppTheme` to manage the state across the app. The preference will be stored in `SharedPreferences`.

## Proposed Changes

### [Theme Management]

#### [MODIFY] [app_theme.dart](file:///home/efrra/ADC-Final/rooted/lib/theme/app_theme.dart)
- Define a `darkTheme` `ThemeData`.
- Add a `ValueNotifier<ThemeMode> themeNotifier` to handle dynamic switching.
- Add methods to toggle and load the theme from storage.

### [Core Infrastructure]

#### [MODIFY] [main.dart](file:///home/efrra/ADC-Final/rooted/lib/main.dart)
- Wrap `RootedApp` with a `ValueListenableBuilder` to react to theme changes.
- Provide both `theme` and `darkTheme` to `MaterialApp`.

### [UI Components]

#### [MODIFY] [profile_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/profile_screen.dart)
- Add a "Dark Mode" switch in the settings or info section.
- Connect the switch to `AppTheme.themeNotifier`.

## Verification Plan

### Manual Verification
- Toggle the switch in the Profile screen.
- Verify that the entire app (all screens) switches to dark mode.
- Restart the app and verify the theme preference is persisted.
