# Walkthrough - Accessibility Representation

I have added a visual representation for accessible events throughout the app.

## Changes Made

### New Widget
- **File**: [accessibility_badge.dart](file:///home/efrra/ADC-Final/rooted/lib/widgets/accessibility_badge.dart)
- Created `AccessibilityChip`: A blue square badge with a white accessibility icon.
- Created `AccessibilityDetailRow`: A descriptive row for use in detail views.

### Home Screen Integration
- **File**: [homepage_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/homepage_screen.dart)
- Updated both the **Feed** and **Discover** views to display the accessibility chip next to the SDG goals if an event is marked as accessible.

### Event Detail Screen
- **File**: [event_detail_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/event_detail_screen.dart)
- Grouped SDG and Accessibility information under a "Commitments" section.
- Added a clear description: "Accessible for people with reduced mobility" when the event is accessible.

## Verification

### Visual Consistency
- The accessibility badge uses the same size and shadow styling as the existing SDG chips to ensure a unified design language.
- Tooltips were added to the chip for better accessibility and user guidance.

### Data Binding
- The UI checks for both `accessible` and `isAccessible` keys to ensure compatibility with different backend response formats.
