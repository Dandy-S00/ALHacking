## 2025-05-14 - Plaintext Password Storage and Exposure
**Vulnerability:** Passwords were stored in a `plain_password` column and exposed in the admin panel. Authentication used direct string comparison.
**Learning:** The application was using a legacy approach for convenience, allowing admins to see user passwords, which is a critical security risk.
**Prevention:** Implement bcrypt hashing, remove plaintext storage, and use a lazy migration strategy for existing accounts. Always select specific columns in database queries to avoid accidental exposure of sensitive fields.
