## 2025-05-15 - JWT Secret Hardcoded Fallback
**Vulnerability:** The application used a hardcoded fallback secret ('lone_star_secret') for JWT signing and verification if the `JWT_SECRET` environment variable was missing.
**Learning:** Hardcoded fallbacks in authentication logic provide a "fail-open" scenario where security is compromised if the environment is misconfigured.
**Prevention:** Always ensure that security-critical configurations (like secrets) do not have insecure defaults. The application should fail to start or return an error if a required secret is missing.
