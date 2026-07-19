# Walkthrough - Dark Mode Support

I have implemented a full Dark Mode experience with a persistent toggle in the user's profile.

## Changes Made

### 1. Theme Definition
I updated [app_theme.dart](file:///home/efrra/ADC-Final/rooted/lib/theme/app_theme.dart) to include a comprehensive `darkTheme` configuration.
- **Colors**: Introduced `surfaceDark`, `backgroundDark`, and updated text colors for high contrast.
- **Components**: The dark theme covers AppBars, Cards, Inputs, and Buttons, ensuring your brand's green primary color remains consistent but well-balanced against dark backgrounds.
- **Notifier**: Added `themeNotifier` (a `ValueNotifier`) to manage the current `ThemeMode` globally.

### 2. Core Integration
Updated [main.dart](file:///home/efrra/ADC-Final/rooted/lib/main.dart) to:
- Initialize and load the saved theme preference before the app starts.
- Use a `ValueListenableBuilder` to reactively rebuild the `MaterialApp` whenever the theme changes.

### 3. Profile Toggle & UI Refactoring
- **Settings Section**: Added a new "Settings" card in [profile_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/profile_screen.dart) with a "Dark Mode" switch.
- **Theme Awareness**: Refactored the `_InfoCard` and `_InfoRow` components to use `Theme.of(context)` and `colorScheme`. This ensures they automatically adapt to light and dark modes without hardcoded colors.
- **Modal Sheets**: Updated the "Edit Profile" and "Border Picker" bottom sheets to respect the theme's surface colors.

### 4. Persistence
The user's theme choice is saved in `SharedPreferences` via `AppTheme.loadTheme()` and `AppTheme.toggleTheme()`, so it stays applied even after restarting the app.

## Verification Results

### Functionality
- ✅ Toggling Dark Mode instantly updates the entire app.
- ✅ The choice is correctly saved and loaded on app restart.
- ✅ All text remains legible on dark surfaces.
- ✅ Profile components (cards, rows, sheets) correctly swap colors.

### Code Health
- Verified all imports and fixed lint warnings related to deprecated `withOpacity` (replaced with `withValues`).
