#!/usr/bin/env bash
set -euo pipefail

scenario="${1:-}"
threads="${2:-}"
ramp="${3:-}"
duration="${4:-}"
label="${5:-official}"

project_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
backend_pid="${BACKEND_PID:-$(pgrep -n -f '^node server\.js$' || true)}"

if [[ -z "$backend_pid" ]] || ! kill -0 "$backend_pid" 2>/dev/null; then
  echo "Không tìm thấy backend 'node server.js'. Hãy khởi động SUT trước." >&2
  exit 1
fi

timestamp=$(date +%Y%m%d_%H%M%S)
run_label="${label}_${timestamp}"
evidence_dir="$project_dir/evidence/resource-logs/$scenario"
pidstat_file="$evidence_dir/${run_label}_backend_pidstat.txt"
vmstat_file="$evidence_dir/${run_label}_system_vmstat.txt"
metadata_file="$evidence_dir/${run_label}_metadata.txt"
mkdir -p "$evidence_dir"

{
  echo "started_at=$(date --iso-8601=seconds)"
  echo "scenario=$scenario"
  echo "threads=$threads"
  echo "ramp_seconds=$ramp"
  echo "duration_seconds=$duration"
  echo "backend_pid=$backend_pid"
  echo "hostname=$(hostname)"
} > "$metadata_file"

pidstat -h -u -r -p "$backend_pid" 1 > "$pidstat_file" &
pidstat_pid=$!
vmstat -t 1 > "$vmstat_file" &
vmstat_pid=$!

cleanup() {
  kill -TERM "$pidstat_pid" "$vmstat_pid" 2>/dev/null || true
  wait "$pidstat_pid" "$vmstat_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

set +e
"$project_dir/scripts/run_scenario.sh" "$scenario" "$threads" "$ramp" "$duration" "$run_label"
run_status=$?
set -e

{
  echo "finished_at=$(date --iso-8601=seconds)"
  echo "exit_status=$run_status"
} >> "$metadata_file"

cleanup
trap - EXIT INT TERM

echo "Backend resource log: $pidstat_file"
echo "System resource log: $vmstat_file"
echo "Run metadata: $metadata_file"
exit "$run_status"

