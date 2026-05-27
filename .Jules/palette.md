# Palette's Performance Journal - LoneStar Luck

This journal documents critical UX and accessibility learnings for the LoneStar Luck platform.

## 2025-05-27 - Accessibility & Feedback Patterns in Monorepo UI
**Learning:** Icon-heavy interfaces in both React (Web) and React Native (Mobile) frequently overlook screen reader support. Specifically, icon-only buttons without `aria-label` or `accessibilityLabel` are inaccessible. Additionally, asynchronous actions (Login, Add Player) lack micro-feedback, leading to potential duplicate requests and user confusion.
**Action:** Always implement `aria-label` for web icon buttons and `accessibilityLabel` + `accessibilityRole="button"` for mobile. Ensure all primary async actions have a loading state that disables the button and provides textual feedback (e.g., "Adding...").
