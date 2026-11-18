#!/usr/bin/env bash
set -euo pipefail

base_url="${BASE_URL:-http://localhost:3000}"
csv_file="${1:-test-data/users.csv}"

if ! curl --silent --fail "$base_url/api/products" >/dev/null; then
  echo "Backend chưa sẵn sàng tại $base_url" >&2
  exit 1
fi

created=0
existing=0
while IFS=',' read -r email password name phone address keyword; do
  if [[ "$email" == "email" || -z "$email" ]]; then
    continue
  fi

  login_status=$(curl --silent --output /dev/null --write-out '%{http_code}' \
    --header 'Content-Type: application/json' \
    --data "{\"email\":\"$email\",\"password\":\"$password\"}" \
    "$base_url/api/login")
  if [[ "$login_status" == "200" ]]; then
    ((existing+=1))
    continue
  fi

  payload=$(printf '{"name":"%s","email":"%s","password":"%s"}' "$name" "$email" "$password")
  response=$(curl --silent --write-out $'\n%{http_code}' \
    --header 'Content-Type: application/json' \
    --data "$payload" \
    "$base_url/api/register")
  status=${response##*$'\n'}

  if [[ "$status" == "200" ]]; then
    ((created+=1))
  else
    echo "Seed thất bại cho $email (HTTP $status)" >&2
    exit 1
  fi
done < "$csv_file"

sample_email=$(sed -n '2s/,.*//p' "$csv_file")
sample_password=$(sed -n '2s/^[^,]*,\([^,]*\).*/\1/p' "$csv_file")
login_status=$(curl --silent --output /dev/null --write-out '%{http_code}' \
  --header 'Content-Type: application/json' \
  --data "{\"email\":\"$sample_email\",\"password\":\"$sample_password\"}" \
  "$base_url/api/login")

if [[ "$login_status" != "200" ]]; then
  echo "Seed xong nhưng đăng nhập kiểm tra thất bại (HTTP $login_status)" >&2
  exit 1
fi

echo "Seed hoàn tất: created=$created existing=$existing; sample login=200"

