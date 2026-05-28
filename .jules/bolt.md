## 2025-05-14 - Parallelize admin data fetching
**Learning:** Sequential await statements in data-fetching logic create a network waterfall, increasing page load time by the sum of all request durations. Using `Promise.all` allows independent requests to execute in parallel.
**Action:** Always check for independent `await` calls in `useEffect` or data-fetching functions and parallelize them with `Promise.all`.
