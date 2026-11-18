---
name: performance-jtl-review
description: Analyse JMeter CSV JTL results, compare load phases, identify primary versus cascading failures, and prepare evidence-grounded performance findings. Use for EShop-style numbered API workflows after real JMeter execution; do not use to invent missing measurements.
---

# Performance JTL Review

Use raw JTL as the source of truth and preserve it unchanged. Treat HTML dashboards as a view that may use a bounded percentile window, not automatically as an exact whole-run calculation.

## Workflow

1. Confirm the JTL is CSV and contains `timeStamp`, `elapsed`, `label`, `success`, response code, and thread counts.
2. Run `node scripts/check_jtl.mjs <file.jtl>` for per-endpoint sample count, failures, average, and exact p95.
3. For load, stress, or endurance, run `node scripts/analyze_jtl_windows.mjs <file.jtl> 30`. Report sustained windows separately from ramp-up and do not let a whole-run average hide late degradation.
4. For spike tests, obtain the run start time and execute `node scripts/analyze_spike_phases.mjs <file.jtl> <ISO_START> <DELAY_SECONDS> <BURST_SECONDS> [RECOVERY_GRACE_SECONDS]`.
5. Cross-check latency and errors with backend and system resource logs. State causality only when evidence supports it; otherwise label the cause as a hypothesis.
6. Separate primary failures such as timeouts from downstream correlation failures. If an extractor fallback such as `NOT_FOUND` causes invalid later requests, recommend stopping the current iteration after the first failed sampler and rerunning.
7. Produce a compact result table containing configuration, samples, throughput, p95, error rate, resource peak, and observed stability. Distinguish the highest verified stable level from the unknown mathematical maximum.

Read [references/evidence-rules.md](references/evidence-rules.md) before writing conclusions or reviewing AI recommendations.

## Boundaries

- Never fabricate JTL, screenshots, narration, hardware data, or thresholds.
- Do not call a short smoke run an endurance result.
- Do not classify a recommendation such as an index, WAL, cache, or connection pool as feasible until it is checked against the SUT code and observed bottleneck.
- Keep unsuccessful and calibration runs; label them clearly instead of replacing them silently.

