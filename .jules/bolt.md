## 2025-05-12 - NVD API Caching and Rate-Limiting Refactor
**Learning:** Redundant API calls for identical services across multiple hosts were significantly slowing down recon. Global rate-limiting in the reporter also penalized cached hits and services without products.
**Action:** Implemented in-memory caching using `sync.Map` and moved rate-limiting into the networking layer to only trigger on actual API requests.
