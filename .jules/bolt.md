## 2026-05-15 - Parallelizing Admin Data Fetching
**Learning:** Sequential await calls for independent data sources in React components create unnecessary network waterfalls, increasing the perceived loading time. Parallelizing these requests with Promise.all reduces the total fetching time to the duration of the slowest request.
**Action:** Always check for independent asynchronous operations that can be parallelized, especially in data-heavy views like admin dashboards.
