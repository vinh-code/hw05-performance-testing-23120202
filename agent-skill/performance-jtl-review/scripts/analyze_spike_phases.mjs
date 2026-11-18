import fs from "node:fs";

const [jtlFile, startedAt, delayArg = "60", burstArg = "30", graceArg = "10"] = process.argv.slice(2);
if (!jtlFile || !startedAt) {
  console.error("Usage: node scripts/analyze_spike_phases.mjs FILE.jtl STARTED_AT [SPIKE_DELAY] [SPIKE_DURATION]");
  process.exit(2);
}

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * ratio) - 1];
}

const delay = Number(delayArg);
const burstDuration = Number(burstArg);
const recoveryGrace = Number(graceArg);
const startMs = Date.parse(startedAt);
const burstStart = startMs + delay * 1000;
const burstEnd = burstStart + burstDuration * 1000;
const settledRecoveryStart = burstEnd + recoveryGrace * 1000;
const lines = fs.readFileSync(jtlFile, "utf8").trim().split(/\r?\n/);
const header = parseCsvLine(lines.shift());
const index = Object.fromEntries(header.map((name, i) => [name, i]));
const phases = {
  "Pre-spike baseline": [],
  "Spike burst": [],
  "Immediate recovery": [],
  "Settled recovery": [],
};

for (const line of lines) {
  const row = parseCsvLine(line);
  if (!/^\d{2} /.test(row[index.label] ?? "")) continue;
  const timestamp = Number(row[index.timeStamp]);
  const phase = timestamp < burstStart
    ? "Pre-spike baseline"
    : timestamp < burstEnd
      ? "Spike burst"
      : timestamp < settledRecoveryStart
        ? "Immediate recovery"
        : "Settled recovery";
  phases[phase].push(row);
}

console.log("Phase\tSamples\tFailures\tThroughput(req/s)\tAverage(ms)\tp95(ms)\tp99(ms)\tMax(ms)");
for (const [name, rows] of Object.entries(phases)) {
  const elapsed = rows.map((row) => Number(row[index.elapsed]));
  const failures = rows.filter((row) => row[index.success] !== "true").length;
  const first = Math.min(...rows.map((row) => Number(row[index.timeStamp])));
  const last = Math.max(...rows.map((row) => Number(row[index.timeStamp]) + Number(row[index.elapsed])));
  const measuredSeconds = Math.max((last - first) / 1000, 0.001);
  const average = elapsed.reduce((sum, value) => sum + value, 0) / elapsed.length;
  console.log([
    name,
    rows.length,
    failures,
    (rows.length / measuredSeconds).toFixed(2),
    average.toFixed(2),
    percentile(elapsed, 0.95),
    percentile(elapsed, 0.99),
    Math.max(...elapsed),
  ].join("\t"));
}

