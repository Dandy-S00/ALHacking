## 2026-05-15 - Lazy Migration of Plaintext Passwords
**Vulnerability:** Plaintext password storage and verification.
**Learning:** Migrating from plaintext to hashed passwords requires a strategy to prevent locking out existing users. A "lazy migration" approach—hashing the password upon the next successful login—is effective for transitioning legacy data without a complex batch migration or downtime.
**Prevention:** Always use secure hashing (like bcrypt) from the start. When migrating legacy systems, ensure backward compatibility with a plan to eventually deprecate and remove support for insecure methods.
