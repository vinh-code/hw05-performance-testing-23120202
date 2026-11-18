# Verified result summary

Nguồn dữ liệu: raw JTL, JMeter HTML report, backend `pidstat` và system `vmstat` ngày 2026-11-18.

| Run | Main configuration | Samples | Throughput | Exact p95 | Error rate | Outcome |
|---|---|---:|---:|---:|---:|---|
| Load | 20 users, 300 s | 7,392 | 24.75 req/s overall | 15 ms | 0% | Stable |
| Stress | 1,000 users, 180 s | 220,812 | 1,232.12 req/s overall | 79 ms | 0% | No crash; transient latency up to 1,466 ms |
| Spike burst | baseline 20 + burst 1,000 | 32,876 burst samples | 1,079.03 req/s burst | 1,084 ms burst | 0% | Settled recovery p95 12 ms after 10 s |
| Endurance | 800 users, 630 s | 672,600 | 1,067.82 req/s overall | 582 ms overall | 0.0428% overall | Failed stability criterion after 510 s |
| Endurance | 500 users, 630 s | 453,440 | 718.9 req/s overall | 95 ms overall | 0% | Failed latency stability criterion after 570 s |
| Endurance | 300 users, 630 s | 281,516 | 447.48 req/s overall; ~457 sustained | 16 ms | 0% | Highest verified stable tested level |

Không dùng smoke/verify run làm kết quả chính thức.

