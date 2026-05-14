# Bolt's Journal ⚡

## 2026-05-14 - Parallelize Data Fetching in Admin Panel
**Learning:** Sequential asynchronous operations (using `await` on multiple requests one after another) create unnecessary latency. In the Admin Panel, fetching players and transactions sequentially meant the user had to wait for the sum of both request times.
**Action:** Use `Promise.all()` to fire multiple independent requests simultaneously, reducing total wait time to the duration of the longest single request.
