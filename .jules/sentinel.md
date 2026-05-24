## 2025-05-15 - Implement bcrypt hashing and secure JWT handling
**Vulnerability:** Plaintext password storage in `plain_password` column and hardcoded JWT secret fallback 'lone_star_secret'.
**Learning:** Storing plaintext passwords alongside hashes (or instead of them) exposes user credentials completely in case of database access. Hardcoded JWT secrets allow for trivial token forgery if the default is known.
**Prevention:** Always use strong hashing algorithms like bcrypt for passwords. Never provide default fallbacks for security-critical environment variables like `JWT_SECRET`.
