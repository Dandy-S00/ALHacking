## 2026-05-29 - Optimize games list allocation in user-app
**Learning:** Defining static data structures like the `games` array inside a React component's body causes unnecessary re-allocations on every render, increasing memory pressure and potentially slowing down reconciliation.
**Action:** Move static data structures outside the component scope or memoize them if they depend on props/state.
