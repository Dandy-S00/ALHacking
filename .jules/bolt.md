## 2026-05-18 - Parallel Dashboard Data Fetching
**Learning:** Sequential await calls in React components for independent data sources double the initial loading time.
**Action:** Always use Promise.all when fetching multiple independent datasets during component mount.
