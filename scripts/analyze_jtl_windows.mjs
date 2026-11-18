import fs from "node:fs";
import readline from "node:readline";

const [filename, windowArg = "30"] = process.argv.slice(2);
const windowSeconds = Number(windowArg);
if (!filename || !Number.isFinite(windowSeconds) || windowSeconds <= 0) {
  console.error("Usage: node scripts/analyze_jtl_windows.mjs FILE.jtl [WINDOW_SECONDS]");
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
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      fields.push(current);
      current = "";
    } else current += char;
  }
  fields.push(current);
  return fields;
}

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * ratio) - 1];
}

const input = readline.createInterface({ input: fs.createReadStream(filename), crlfDelay: Infinity });
let index;
let firstTimestamp;
const buckets = new Map();
const failuresByReason = new Map();

for await (const line of input) {
  if (!index) {
    const header = parseCsvLine(line);
    index = Object.fromEntries(header.map((name, i) => [name, i]));
    continue;
  }
  const row = parseCsvLine(line);
  if (!/^\d{2} /.test(row[index.label] ?? "")) continue;
  const timestamp = Number(row[index.timeStamp]);
  firstTimestamp ??= timestamp;
  const bucketNumber = Math.floor((timestamp - firstTimestamp) / (windowSeconds * 1000));
  const bucket = buckets.get(bucketNumber) ?? { elapsed: [], failures: 0 };
  bucket.elapsed.push(Number(row[index.elapsed]));
  if (row[index.success] !== "true") {
    bucket.failures += 1;
    const reason = `${row[index.label]} | ${row[index.responseCode]} | ${row[index.responseMessage]}`;
    failuresByReason.set(reason, (failuresByReason.get(reason) ?? 0) + 1);
  }
  buckets.set(bucketNumber, bucket);
}

console.log("Window\tSamples\tFailures\tError(%)\tThroughput(req/s)\tAverage(ms)\tp95(ms)\tp99(ms)\tMax(ms)");
for (const [number, bucket] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
  const sum = bucket.elapsed.reduce((total, value) => total + value, 0);
  console.log([
    `${number * windowSeconds}-${(number + 1) * windowSeconds}s`,
    bucket.elapsed.length,
    bucket.failures,
    (bucket.failures * 100 / bucket.elapsed.length).toFixed(3),
    (bucket.elapsed.length / windowSeconds).toFixed(2),
    (sum / bucket.elapsed.length).toFixed(2),
    percentile(bucket.elapsed, 0.95),
    percentile(bucket.elapsed, 0.99),
    Math.max(...bucket.elapsed),
  ].join("\t"));
}

if (failuresByReason.size > 0) {
  console.log("\nFailure reasons:");
  for (const [reason, count] of [...failuresByReason.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${count}\t${reason}`);
  }
}

