# Evidence rules

## Percentiles

An exact percentile calculated from every raw JTL sample can differ from JMeter's generated HTML dashboard. The report generator may use a bounded `jmeter.reportgenerator.statistic_window` and therefore emphasize later samples when the run exceeds that window. Record the source and scope of every percentile rather than selecting the more favorable number.

## Time phases

- Exclude ramp-up when reporting sustained throughput, but retain it in the raw run and whole-run summary.
- For Spike, report pre-spike baseline, burst, immediate recovery, and settled recovery separately.
- For Endurance, use fixed windows. A low whole-run error rate can hide a severe final-window failure rate.

## Failures

Identify the earliest failure in a workflow iteration. A timeout can invalidate a token or extracted ID and create later 400, 403, or 404 responses. These are real observed samples but should be described as cascading effects, not independent root causes.

## Resource evidence

Resource correlation supports a hypothesis but rarely proves root cause. Examples:

- Rising RSS with later garbage-collection drops is not sufficient evidence of a memory leak.
- Low CPU during high latency can indicate waiting on I/O or locks, but requires further profiling for confirmation.
- When the load generator and SUT share a machine, report that limitation because client contention can distort the threshold.

## Threshold wording

Prefer: "The highest verified stable tested level was 300 users at approximately 457 sustained requests/s for 10 minutes. The actual boundary lies between tested levels 300 and 500 under this setup."

Avoid: "The absolute maximum is 457 requests/s" unless intermediate search and repeated confirmation establish that claim.

