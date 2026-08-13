## 2025-05-15 - [Lazy Password Migration]
**Vulnerability:** Plaintext password storage in the `users` table.
**Learning:** Transitioning to hashed passwords requires a 'lazy migration' strategy to support existing users without forcing a reset.
**Prevention:** Always hash passwords before database storage and avoid storing plaintext versions, even for administrative purposes.
