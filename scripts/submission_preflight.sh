#!/usr/bin/env bash
set -u

project_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$project_dir"

missing=0
check_file() {
  if [[ -s "$1" ]]; then
    printf 'OK      %s\n' "$1"
  else
    printf 'MISSING %s\n' "$1"
    missing=$((missing + 1))
  fi
}

check_dir() {
  if [[ -d "$1" && -n "$(find "$1" -mindepth 1 -print -quit 2>/dev/null)" ]]; then
    printf 'OK      %s/\n' "$1"
  else
    printf 'MISSING %s/\n' "$1"
    missing=$((missing + 1))
  fi
}

echo 'Required documents'
for file in \
  README.md \
  report/main_report.md report/main_report.pdf \
  report/ai_critique.md report/ai_critique.pdf \
  report/ai_audit_report.md report/ai_audit_report.pdf \
  git_commit_log.txt; do
  check_file "$file"
done

echo
echo 'Test plans and data'
for file in \
  test-plans/23120202_Load_20261117.jmx \
  test-plans/23120202_Stress_20261117.jmx \
  test-plans/23120202_Spike_20261117.jmx \
  test-data/users.csv; do
  check_file "$file"
done

echo
echo 'Selected raw results'
check_file results/load/official_20261118_125540_20261118_125540.jtl
check_file results/stress/calibration1000_20261118_131826_20261118_131826.jtl
check_file results/spike/official_20261118_132254_20261118_132254.jtl
check_file results/load/endurance300_20261118_135257_20261118_135257.jtl
check_dir html-reports/load/official_20261118_125540_20261118_125540
check_dir html-reports/stress/calibration1000_20261118_131826_20261118_131826
check_dir html-reports/spike/official_20261118_132254_20261118_132254
check_dir html-reports/load/endurance300_20261118_135257_20261118_135257

echo
echo 'Skill and supporting evidence'
check_file evidence/hardware_spec.txt
check_dir evidence/resource-logs
check_file agent-skill/performance-jtl-review/SKILL.md
check_file issues/ISSUE-001-endurance-degradation.md

echo
echo 'Manual/public evidence'
if find evidence -maxdepth 2 -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -print -quit | grep -q .; then
  echo 'OK      resource/hardware screenshots'
else
  echo 'MISSING resource/hardware screenshots'
  missing=$((missing + 1))
fi

if [[ -s evidence/video_link.txt ]] && ! grep -qi 'CHƯA\|TBD' evidence/video_link.txt; then
  echo 'OK      evidence/video_link.txt'
else
  echo 'MISSING unlisted YouTube video link'
  missing=$((missing + 1))
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "OK      public repository remote: $(git remote get-url origin)"
else
  echo 'MISSING public GitHub repository remote'
  missing=$((missing + 1))
fi

if [[ -s evidence/github_issue_url.txt ]] && grep -Eq '^https://github\.com/.+/issues/[0-9]+' evidence/github_issue_url.txt; then
  echo 'OK      evidence/github_issue_url.txt'
else
  echo 'MISSING published GitHub issue URL'
  missing=$((missing + 1))
fi

echo
if (( missing > 0 )); then
  echo "Preflight FAILED: $missing required item(s) missing. Do not create the final ZIP yet."
  exit 1
fi

echo 'Preflight PASSED: submission can be packaged.'

