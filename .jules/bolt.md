## 2025-05-13 - Caching and Connection Reuse for NVD API
**Learning:** In network-heavy tools, redundant API calls and artificial delays in the main loop can significantly degrade performance, especially when scanning multiple hosts with similar services. Caching and reusing HTTP clients are essential.
**Action:** Always implement caching for rate-limited external APIs and use a shared `http.Client` for TCP/TLS connection reuse. Move rate-limiting delays to the cache-miss path to ensure immediate response for cached hits.
