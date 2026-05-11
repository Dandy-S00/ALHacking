## 2025-05-11 - [Argument Injection in External CLI Wrappers]
**Vulnerability:** Positional arguments were being concatenated into a single string and then split with `strings.Fields()`, allowing user-provided product names or versions to inject new flags (e.g., `-` prefixes) or additional arguments into the `searchsploit` command.
**Learning:** Using string manipulation to build command arguments is fragile and bypasses the safety provided by `exec.Command`. External tools like `searchsploit` may have flags that can be triggered by seemingly benign input.
**Prevention:** Always pass command arguments as individual strings in a slice to `exec.Command`. Sanitize positional inputs to remove leading dashes (`strings.TrimLeft(input, "-")`) to ensure they are never interpreted as flags.

## 2025-05-11 - [Secure Defaults for Sensitive Reports]
**Vulnerability:** Vulnerability scan reports were saved with `0644` permissions, making them world-readable on multi-user systems.
**Learning:** Reconnaissance and vulnerability data are sensitive. Security tools should default to the most restrictive permissions necessary.
**Prevention:** Use `0600` (owner read/write only) when creating files containing scan results or other sensitive discovery data.
