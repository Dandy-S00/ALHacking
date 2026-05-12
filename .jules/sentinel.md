## 2025-05-21 - Argument Injection via Strings.Fields
**Vulnerability:** Command argument injection when using `exec.Command` with `strings.Fields`.
**Learning:** Using `strings.Fields` on a single query string to generate arguments for `exec.Command` allows attackers to inject additional flags or parameters if the input contains spaces or starts with leading dashes.
**Prevention:** Always pass command arguments as individual strings in a slice to `exec.Command`, and sanitize positional inputs by trimming leading dashes to prevent flag injection.
