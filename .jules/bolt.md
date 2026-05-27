## 2025-05-15 - Parallel Data Fetching in Admin Panel
**Learning:** The admin panel previously fetched player data and transaction data sequentially, creating a network waterfall. By using `Promise.all`, these requests are parallelized, reducing the total dashboard load time by the duration of the shorter request (approximately 50% reduction in initialization latency on high-latency connections).
**Action:** Always check for independent `await` calls in `useEffect` or initialization logic and group them with `Promise.all` to optimize frontend performance.
