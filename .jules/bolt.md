## 2025-05-14 - Parallelize Data Fetching in Admin Panel
**Learning:** Sequential `await` calls for independent data sources in React `useEffect` hooks create avoidable latency. Using `Promise.all` allows the browser to initiate multiple requests simultaneously, improving perceived performance.
**Action:** Always check for independent `await` calls that can be parallelized, especially in initialization or data-fetching logic.
