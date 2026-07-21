# Walkthrough - Robust Token Expiration & Auto-Logout

I have implemented a comprehensive session management system that ensures users are automatically and securely logged out when their authentication token expires.

## Changes Made

### Session Tracking
- **[SessionStorage](file:///home/efrra/ADC-Final/rooted/lib/services/session_storage.dart)**: Added support for storing the `expiresAt` timestamp provided by the backend. This allows the app to know exactly when a session will become invalid without needing to call an API.

### Robust API Security
- **[ApiService](file:///home/efrra/ADC-Final/rooted/lib/services/api_service.dart)**:
    - Standardized error handling across all authenticated endpoints to ensure that any `9901` (Unauthorized) or `9902` (Token Expired) response immediately triggers the `forceLogout` sequence.
    - Added proactive helper methods: `isSessionExpired()` to check stored state and `checkAndForceLogout()` to execute the redirect.

### Authentication Integration
- **[Login](file:///home/efrra/ADC-Final/rooted/lib/screens/login_screen.dart)** and **[Register](file:///home/efrra/ADC-Final/rooted/lib/screens/register_screen.dart)** flows now extract the `expiresAt` field from the successful login response and persist it to secure storage.

### Proactive App-Level Enforcement
- **[Main Entry Point](file:///home/efrra/ADC-Final/rooted/lib/main.dart)**: On app launch, the system now performs an immediate check. If a stored session exists but is expired, it is cleared instantly, ensuring the user never lands on a dashboard with stale data.
- **[Home Dashboard](file:///home/efrra/ADC-Final/rooted/lib/screens/home_screen.dart)**: Added a background `Timer` that runs every minute while the app is active. This ensures that if a user leaves the app open for a long duration, they will be automatically redirected to the Login screen the moment their session expires.

## Verification Results

- Verified that `ApiService.forceLogout()` correctly clears all local data and resets the navigation stack to `LoginScreen`.
- Standardized `updateEvent` to use the unified `_checkBodyError` logic.
- Confirmed background timer lifecycle management (starts in `initState`, stops in `dispose`).

> [!IMPORTANT]
> Users will now see a "Session expired" message if they attempt to perform actions after their token has timed out, protecting their account from unauthorized access if the device is left unattended.
