import fs from "node:fs";

const filename = process.argv[2];
if (!filename) {
  console.error("Usage: node scripts/check_jtl.mjs results/path/file.jtl");
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
  return sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)];
}

const lines = fs.readFileSync(filename, "utf8").trim().split(/\r?\n/);
const header = parseCsvLine(lines.shift());
const index = Object.fromEntries(header.map((name, i) => [name, i]));
const rows = lines.map(parseCsvLine).filter((row) => /^\d{2} /.test(row[index.label] ?? ""));

if (rows.length === 0) {
  console.error("Không tìm thấy request samples có nhãn 01..08");
  process.exit(1);
}

const byLabel = new Map();
for (const row of rows) {
  const label = row[index.label];
  const item = byLabel.get(label) ?? { elapsed: [], failures: 0 };
  item.elapsed.push(Number(row[index.elapsed]));
  if (row[index.success] !== "true") item.failures += 1;
  byLabel.set(label, item);
}

console.log("Label\tSamples\tFailures\tAverage(ms)\tp95(ms)");
for (const [label, item] of [...byLabel.entries()].sort()) {
  const average = item.elapsed.reduce((sum, value) => sum + value, 0) / item.elapsed.length;
  console.log(`${label}\t${item.elapsed.length}\t${item.failures}\t${average.toFixed(2)}\t${percentile(item.elapsed, 0.95)}`);
}

const allElapsed = rows.map((row) => Number(row[index.elapsed]));
const totalAverage = allElapsed.reduce((sum, value) => sum + value, 0) / allElapsed.length;
console.log(`TOTAL\t${rows.length}\t${rows.filter((row) => row[index.success] !== "true").length}\t${totalAverage.toFixed(2)}\t${percentile(allElapsed, 0.95)}`);

const failures = rows.filter((row) => row[index.success] !== "true");
console.log(`\nRequest samples: ${rows.length}`);
console.log(`Failures: ${failures.length}`);
console.log(`Error rate: ${(failures.length * 100 / rows.length).toFixed(4)}%`);
if (failures.length > 0) {
  console.log("\nFailure details:");
  for (const row of failures.slice(0, 20)) {
    console.log(`- ${row[index.label]}: HTTP ${row[index.responseCode]} – ${row[index.failureMessage] || row[index.responseMessage]}`);
  }
  process.exitCode = 1;
}

