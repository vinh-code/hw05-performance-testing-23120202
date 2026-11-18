import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const count = Number(process.argv[2] ?? 500);
if (!Number.isInteger(count) || count < 1 || count > 5000) {
  console.error("Usage: node scripts/generate_test_data.mjs [count from 1 to 5000]");
  process.exit(2);
}

const keywords = ["iPhone", "Samsung", "MacBook", "AirPods", "Keychron"];
const rows = ["email,password,name,phone,address,keyword"];
for (let i = 1; i <= count; i += 1) {
  const suffix = String(i).padStart(4, "0");
  const phone = `09${String(10000000 + i).padStart(8, "0")}`;
  rows.push([
    `perf${suffix}@example.test`,
    "Test1234!",
    `Perf User ${suffix}`,
    phone,
    `${suffix} Nguyen Van Cu District 1 HCMC`,
    keywords[(i - 1) % keywords.length],
  ].join(","));
}

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(projectDir, "test-data", "users.csv");
fs.writeFileSync(target, `${rows.join("\n")}\n`, "utf8");
console.log(`Generated ${count} rows in ${path.relative(projectDir, target)}`);

