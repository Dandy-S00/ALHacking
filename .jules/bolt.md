## 2025-05-14 - [In-memory caching for service lookups]
**Learning:** Redundant services across multiple hosts/ports lead to significant performance bottlenecks due to expensive external API calls and conservative rate-limiting sleeps. By caching results keyed by service identity (product, version, CPEs), we can skip both the network request and the mandatory sleep, drastically reducing total scan time.
**Action:** Always consider memoization for expensive operations that might be repeated with the same parameters within a single execution flow.
