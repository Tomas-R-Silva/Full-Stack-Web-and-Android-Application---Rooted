# Implementation Plan - Visual Representation for Accessible Events

The goal is to provide a visual badge for events that are marked as accessible for people with disabilities, similar to how SDGs are currently represented with colour-coded chips.

## User Review Required

> [!IMPORTANT]
> I will use the `Icons.accessible` icon within a colour-coded square badge to maintain consistency with the SDG chip design. The badge will be blue, which is commonly associated with accessibility.

## Proposed Changes

### [Component] Widgets

#### [NEW] [accessibility_badge.dart](file:///home/efrra/ADC-Final/rooted/lib/widgets/accessibility_badge.dart)
Create a new widget for the accessibility badge.
- `AccessibilityChip`: A square badge with the accessibility icon.
- `AccessibilityDetailListTile`: A row with the chip and a descriptive label, for use in the detail screen.

### [Component] Screens

#### [MODIFY] [homepage_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/homepage_screen.dart)
Update the event cards to show the accessibility badge if the event is marked as accessible.
- In `_buildTinderCard` (Discover view): Add `AccessibilityChip` next to the `SdgChipRow`.
- In `_buildEventCard` (Feed view): Add `AccessibilityChip` next to the `SdgChipRow`.

#### [MODIFY] [event_detail_screen.dart](file:///home/efrra/ADC-Final/rooted/lib/screens/event_detail_screen.dart)
Update the event detail screen to show a dedicated accessibility section if the event is accessible.
- Add an "Accessibility" section similar to the "Sustainability Goals" section, using `AccessibilityChip` and a label.

## Verification Plan

### Manual Verification
1. Create or find an event marked as accessible.
2. Verify that a blue accessibility badge (square icon) appears on the event card in the Feed view.
3. Verify the same badge appears in the Discover view cards.
4. Open the event detail screen and verify that there is a clear "Accessibility" section with the icon and label "This event is accessible".
