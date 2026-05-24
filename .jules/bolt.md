## 2025-05-14 - Parallelize admin data fetching
**Learning:** Sequential API calls in the frontend's initialization phase create a cumulative delay that can be easily halved by using `Promise.all` for independent requests.
**Action:** Always check if multiple `await` calls in a row are independent and can be parallelized with `Promise.all`.
