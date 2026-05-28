## 2025-05-28 - Admin Panel Accessibility and Feedback
**Learning:** Icon-only buttons (like the Logout button) and form inputs without linked labels are common accessibility gaps in this repository's admin panel. Primary action buttons also lacked loading states, which can lead to duplicate requests.
**Action:** Always ensure `htmlFor`/`id` pairs for form inputs and `aria-label` for icon-only buttons. Implement loading states for primary action buttons to improve micro-feedback.
