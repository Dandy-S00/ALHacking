# Sentinel Journal

## 2025-05-14 - [Initial Entry]
**Vulnerability:** Plaintext password storage and comparison in `authController.ts`.
**Learning:** The application was comparing passwords directly in plaintext and storing them in a `plain_password` column, exposing users to credential theft in case of database compromise.
**Prevention:** Always hash passwords using a strong algorithm like bcrypt before storing them, and use secure comparison functions.

## 2025-05-14 - [Lazy Migration Edge Case]
**Vulnerability:** Persistent plaintext passwords during transition.
**Learning:** If a creation method still populates plaintext fields alongside hashed ones, the lazy migration (which only triggers on hash mismatch) will never run, leaving sensitive data exposed forever.
**Prevention:** Always stop populating plaintext fields immediately when introducing hashing, and ensure migration logic accounts for all entry points.
