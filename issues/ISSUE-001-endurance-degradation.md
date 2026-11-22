# [PERF] Throughput collapses late in sustained checkout workload

## Status

Published as [GitHub Issue #1](https://github.com/vinh-code/hw05-performance-testing-23120202/issues/1).

## Environment

- EShop backend, Node.js + Express + SQLite
- Ubuntu 24.04.5, Intel i7-12650H, 15 GiB RAM
- JMeter 5.6.3 on the same host

## Steps to reproduce

1. Start a clean backend database.
2. Seed unique test users.
3. Run Flow 4 continuously: login → profile GET/PUT → product search/detail → cart → checkout → order detail.
4. Use 500 users, 30-second ramp-up and 630-second duration with 300–1000 ms think-time.
5. Inspect JTL in fixed 30-second windows.

## Actual result

- From 30–570 seconds: about 756–763 req/s, p95 mostly 19–34 ms, no errors.
- At 570–600 seconds: 596.03 req/s, average 190.58 ms, p95 504 ms.
- At 600–630 seconds: 441.10 req/s, average 454.82 ms, p95 1,246 ms.

At 800 users, degradation begins earlier and the final window reaches p95 4,540 ms with 1.492% errors.

## Expected result

At a declared sustainable load, throughput and p95 should remain within the stated stability band for the full soak duration.

## Evidence

- `evidence/screenshots/05-endurance-degradation.png`
- `results/load/endurance500_20261118_134059_20261118_134059.jtl`
- `results/load/endurance_20261118_132746_20261118_132746.jtl`
- Matching HTML reports and `evidence/resource-logs/load/`

## Notes

SQLite write/I/O contention is a hypothesis, not a confirmed root cause. The backend also retains cart items after checkout, which may contribute to memory growth. Profiling and an A/B WAL run are recommended.

