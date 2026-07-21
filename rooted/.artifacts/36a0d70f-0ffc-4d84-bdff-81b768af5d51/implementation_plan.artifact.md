# Robust Token Expiration & Auto-Logout Implementation Plan

Ensure the user is automatically logged out when their session token expires, both proactively (client-side check) and reactively (backend response handling).

## User Review Required

> [!IMPORTANT]
> The app will now track the session expiration time locally. If the token is found to be expired on startup or during app usage, the user will be immediately redirected to the Login screen to protect their account security.

## Proposed Changes

### [Session Management]

#### [MODIFY] [session_storage.dart](file:///home/efrra/ADC-Final/rooted/lib/services/session_storage.dart)
- Add `_expiresAtKey` constant.
- Update `save()` to accept an optional `int? expiresAt`.
- Add `getExpiresAt()` getter.

#### [MODIFY] [api_service.dart](file:///home/efrra/ADC-Final/rooted/lib/services/api_service.dart)
- Consolidate error handling:
    - Update `createEvent` and `updateEvent` to use `_checkBodyError` to catch `9901/9902` errors.
- Add `isSessionExpired()` helper method to check the stored expiration time.
- Add `checkAndForceLogout()` to perform a proactive check and logout if needed.

### [Authentication Flow]

#### [MODIFY] [login_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/login_screen.dart)
- Extract `expiresAt` from the backend `token` object.
- Pass `expiresAt` to `SessionStorage.save()`.

#### [MODIFY] [register_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/register_screen.dart)
- Extract `expiresAt` from the backend `token` object.
- Pass `expiresAt` to `SessionStorage.save()`.

### [App Lifecycle]

#### [MODIFY] [main.dart](file:///home/efrra/ADC-Final/rooted/lib/main.dart)
- Update `main()` to check if the session is expired before deciding the initial route.
- If logged in, call `ApiService.checkAndForceLogout()` to ensure the user isn't stuck on an expired session from a previous run.

#### [MODIFY] [home_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/home_screen.dart)
- In `initState`, start a periodic timer (e.g., every minute) that calls `ApiService.checkAndForceLogout()`. This handles the case where the app is left open while the token expires.

## Verification Plan

### Manual Verification
1. **Startup Check**: Manually set a past expiration time in `SharedPreferences` (if possible via debug tools) or wait for a session to expire. Open the app and verify it redirects to Login instead of showing the Home screen.
2. **Reactive Check**: Use a token that the backend considers expired. Attempt to perform an action (e.g., create an event). Verify the app shows "Session expired" and redirects to Login.
3. **Background Expiry**: Leave the app on the Home screen. Wait for the session to expire. Verify that the periodic check triggers a redirect to the Login screen.
