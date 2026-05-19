## 2025-05-22 - Optimization Rejection: Backend Query Limitation
**Learning:** Adding a `LIMIT` clause to a backend query without corresponding frontend pagination logic is a functional regression. While it improves performance, it breaks the user's ability to access the full dataset.
**Action:** Always ensure frontend pagination is in place before limiting backend result sets, or choose optimizations that preserve existing functionality exactly.
