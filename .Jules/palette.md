## 2025-05-14 - [Enhanced Accessibility in user-app]
**Learning:** In React Native, icon-only buttons (like the footer navigation and vault button) are invisible to screen readers without explicit labels. Using `accessibilityLabel` and `accessibilityRole="button"` is essential for basic accessibility.
**Action:** Always include accessibility labels and roles for all `TouchableOpacity` elements, especially those without clear text labels.
