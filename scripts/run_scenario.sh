#!/usr/bin/env bash
set -euo pipefail

scenario="${1:-}"
threads="${2:-}"
ramp="${3:-}"
duration="${4:-}"
run_label="${5:-run}"

case "$scenario" in
  load) plan="test-plans/23120202_Load_20261117.jmx" ;;
  stress) plan="test-plans/23120202_Stress_20261117.jmx" ;;
  spike) plan="test-plans/23120202_Spike_20261117.jmx" ;;
  *) echo "Usage: $0 {load|stress|spike} THREADS RAMP_SECONDS DURATION_SECONDS [LABEL]" >&2; exit 2 ;;
esac

for value in "$threads" "$ramp" "$duration"; do
  if [[ ! "$value" =~ ^[1-9][0-9]*$ ]]; then
    echo "THREADS, RAMP_SECONDS và DURATION_SECONDS phải là số nguyên dương" >&2
    exit 2
  fi
done

project_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
jmeter_bin="${JMETER_BIN:-$project_dir/../SEMINAR/PERFORMANCE-TESTING/tools/apache-jmeter-5.6.3/bin/jmeter}"
timestamp=$(date +%Y%m%d_%H%M%S)
stem="${run_label}_${timestamp}"
jtl="$project_dir/results/$scenario/${stem}.jtl"
report="$project_dir/html-reports/$scenario/${stem}"
log="$project_dir/logs/${scenario}_${stem}.log"

mkdir -p "$(dirname "$jtl")" "$(dirname "$report")" "$(dirname "$log")"

if [[ -e "$report" || -e "$jtl" ]]; then
  echo "Output đã tồn tại: $stem" >&2
  exit 1
fi

"$jmeter_bin" -n \
  -t "$project_dir/$plan" \
  -l "$jtl" \
  -e -o "$report" \
  -j "$log" \
  -Jthreads="$threads" \
  -Jramp="$ramp" \
  -Jduration="$duration" \
  -Jthink_base_ms="${THINK_BASE_MS:-300}" \
  -Jthink_random_ms="${THINK_RANDOM_MS:-700}" \
  -Jbaseline_threads="${BASELINE_THREADS:-5}" \
  -Jbaseline_ramp="${BASELINE_RAMP:-5}" \
  -Jspike_delay="${SPIKE_DELAY:-60}" \
  -Jspike_duration="${SPIKE_DURATION:-30}" \
  -Jcsv_path="$project_dir/test-data/users.csv"

echo "JTL: $jtl"
echo "HTML: $report/index.html"
echo "Log: $log"

