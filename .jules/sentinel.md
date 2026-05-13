## 2025-05-14 - Restricted File Permissions for Sensitive Reports
**Vulnerability:** Vulnerability reports containing sensitive network discovery and CVE data were saved with default permissions (`0644`), allowing any user on the system to read them.
**Learning:** Security tools often generate sensitive artifacts that should be restricted to the owner to maintain confidentiality.
**Prevention:** Always use restrictive file permissions (e.g., `0600`) when writing files containing security-sensitive information.

## 2025-05-14 - Argument Injection via Shell Command Concatenation
**Vulnerability:** Command arguments were being split from a single string using `strings.Fields` before being passed to `exec.Command`, which could lead to argument injection if user-controlled input (like product names or versions) contained spaces or shell-sensitive characters.
**Learning:** Splitting a single string into arguments is less secure than passing arguments as individual strings in a slice to `exec.Command`.
**Prevention:** Pass command arguments as individual strings in a slice to `exec.Command` and avoid manually parsing or splitting query strings.
