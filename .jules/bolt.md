# Bolt's Performance Journal

## 2025-05-14 - Parallelizing Independent API Requests
**Learning:** Sequential await calls in `useEffect` or data-fetching functions create a waterfall effect, where each request must finish before the next begins. This unnecessarily increases total loading time when requests are independent.
**Action:** Use `Promise.all` to execute independent asynchronous operations in parallel, reducing the total time to the duration of the slowest request rather than the sum of all requests.
