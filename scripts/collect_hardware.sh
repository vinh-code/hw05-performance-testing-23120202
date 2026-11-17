#!/usr/bin/env bash
set -euo pipefail

output="${1:-evidence/hardware_spec.txt}"
mkdir -p "$(dirname "$output")"
{
  date --iso-8601=seconds
  hostnamectl 2>/dev/null || true
  lscpu
  free -h
  lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS
  java -version 2>&1
  node --version
} > "$output"

echo "Đã lưu thông số dạng text tại $output"
echo "Vẫn phải chụp ảnh hardware report và resource monitor theo đề."

