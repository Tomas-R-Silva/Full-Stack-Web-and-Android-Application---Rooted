# Task: Robust Token Expiration & Auto-Logout

- [x] Update `SessionStorage` for expiration tracking
    - [x] Add `_expiresAtKey` and update `save`, `getExpiresAt`, and `clear`
- [x] Enhance `ApiService` security and helpers
    - [x] Update `createEvent` and `updateEvent` to use standard error checking
    - [x] Implement `isSessionExpired` and `checkAndForceLogout`
- [x] Update authentication flows to capture expiration
    - [x] Extract and save `expiresAt` in `LoginScreen`
    - [x] Extract and save `expiresAt` in `RegisterScreen`
- [x] Implement proactive app-level checks
    - [x] Add startup check in `main.dart`
    - [x] Add periodic background check in `HomeScreen`
- [ ] Verification
    - [ ] Test startup redirect with simulated expired token
    - [ ] Test reactive redirect on API error 9901/9902
    - [ ] Test background auto-logout
