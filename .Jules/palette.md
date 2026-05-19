## 2025-05-15 - [Accessibility Gaps in Inline-Styled Components]
**Learning:** The application uses raw HTML elements with extensive inline styles instead of a component library. This often leads to developers overlooking semantic accessibility features like linking labels to inputs via `htmlFor` and `id`, and providing `aria-label` for icon-only buttons.
**Action:** Always check for unlinked labels and missing descriptions on interactive icon elements in this codebase.
