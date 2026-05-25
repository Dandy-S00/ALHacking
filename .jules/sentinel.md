# Sentinel Security Journal

## 2025-05-25 - Insecure Password Storage and Exposure
**Vulnerability:** Passwords were stored in plaintext in a `plain_password` column and also in the `password` column without hashing. Furthermore, the `plain_password` was being sent to the admin panel and displayed in the UI.
**Learning:** Legacy systems or quick prototypes often trade security for "ease of debugging," leading to dangerous patterns like storing plaintext credentials for administrative visibility.
**Prevention:** Always use strong hashing algorithms (like bcrypt) for password storage from day one. Never return sensitive fields like passwords (even hashed ones) in API responses.
