## 2026-05-10 - [Argument Injection in searchsploit wrapper]
**Vulnerability:** Argument injection via unsanitized service metadata.
**Learning:** Using `strings.Fields` or string concatenation to build arguments for `exec.Command` can allow an attacker (or malicious service banner) to pass unexpected flags to the underlying tool.
**Prevention:** Always pass arguments as a slice to `exec.Command` and sanitize individual arguments to ensure they don't start with dashes if they are meant to be positional data.
