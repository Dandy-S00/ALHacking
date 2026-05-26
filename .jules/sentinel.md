## 2025-05-15 - Secure Password Hashing & JWT Secret Enforcement
**Vulnerability:** The application was storing passwords in plaintext in a `plain_password` column and used a hardcoded fallback for the `JWT_SECRET`.
**Learning:** Transitioning to secure hashing in an active application requires a "lazy migration" strategy to avoid locking out existing users who haven't yet been migrated to hashed storage.
**Prevention:** Use `bcryptjs` for all password storage, implement lazy migration checks during login, and enforce the presence of critical environment variables like `JWT_SECRET` by failing securely if they are missing.
