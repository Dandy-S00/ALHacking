## 2025-02-25 - React Native Accessibility Patterns
**Learning:** In the LoneStar Luck user app, the heavy use of `TouchableOpacity` for custom-styled gold buttons and game cards lacks default accessibility roles and labels, making the interface opaque to screen readers despite being visually rich.
**Action:** Always apply `accessibilityRole="button"` and descriptive `accessibilityLabel` to `TouchableOpacity` elements, especially for icon-only navigation and interactive game tiles.
