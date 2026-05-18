## 2025-05-22 - Plaintext Password Exposure and Lack of Hashing
**Vulnerability:** User passwords were stored in plaintext and exposed in the admin panel's player management table.
**Learning:** The application lacked any password hashing mechanism, relying on a 'plain_password' field for both storage and administrative visibility.
**Prevention:** Always use bcrypt for password hashing and never expose raw or even hashed passwords in the frontend UI. Implement lazy migration to secure legacy accounts during login.
