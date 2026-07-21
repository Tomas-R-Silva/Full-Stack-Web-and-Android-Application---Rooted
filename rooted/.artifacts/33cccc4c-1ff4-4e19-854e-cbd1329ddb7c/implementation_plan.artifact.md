# Remove Forced Logout Implementation Plan

Remove the automatic logout behavior triggered by session expiration or authentication errors.

## User Review Required

> [!IMPORTANT]
> The app will no longer automatically redirect to the Login screen when a session expires or when an "Unauthorized" error (401/403) is received from the backend. Users will remain on their current screen, though subsequent authenticated requests may fail with error messages.

## Proposed Changes

### [Service Layer]

#### [MODIFY] [api_service.dart](file:///home/efrra/ADC-Final/rooted/lib/services/api_service.dart)
- Remove `checkAndForceLogout()` method.
- Update `_checkBodyError` to stop calling `forceLogout()` when encountering 9901/9902 or 401/403 status codes. It will still throw an `ApiException`, allowing the UI to show an error message.

### [App Lifecycle]

#### [MODIFY] [main.dart](file:///home/efrra/ADC-Final/rooted/lib/main.dart)
- Remove the proactive `isSessionExpired()` check in `main()`. This prevents the app from clearing the session on startup just because of a timestamp.

#### [MODIFY] [home_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/home_screen.dart)
- Remove the periodic `_sessionTimer` that checks for session expiration.
- Remove `WidgetsBindingObserver` and the `didChangeAppLifecycleState` override that performed session checks when resuming the app.

## Verification Plan

### Manual Verification
1. **Startup**: Manually set a past expiration time in storage (or use a token that is theoretically expired). Open the app and verify it stays on the Home screen (if previously logged in).
2. **Usage**: Attempt an authenticated action with an expired token. Verify that an error message (SnackBar) appears, but the app does **not** redirect to the Login screen.
3. **Manual Logout**: Verify that the "Log Out" button in the Profile screen still works as expected.
