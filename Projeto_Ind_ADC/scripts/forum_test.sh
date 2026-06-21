#!/usr/bin/env bash
# Quick end-to-end test of the forum endpoints.
# Usage: ./scripts/forum_test.sh <username> <password> <eventId> [baseUrl]
set -euo pipefail

USER="${1:?username required}"
PASS="${2:?password required}"
EVENT_ID="${3:?eventId required}"
BASE="${4:-http://localhost:8080}"

echo "== 1. Login =="
JWT=$(curl -s -X POST "$BASE/rest/login" \
  -H 'Content-Type: application/json' \
  -d "{\"input\":{\"username\":\"$USER\",\"password\":\"$PASS\"}}" \
  | grep -o '"jwt":"[^"]*"' | head -1 | sed 's/"jwt":"//;s/"//')

if [ -z "$JWT" ]; then echo "Login failed"; exit 1; fi
echo "JWT acquired."

echo "== 2. Post a message =="
curl -s -X POST "$BASE/rest/forum/post" \
  -H 'Content-Type: application/json' \
  -d "{\"token\":{\"jwt\":\"$JWT\"},\"eventId\":\"$EVENT_ID\",\"text\":\"Hello from forum_test at $(date +%T)\"}"
echo; echo

echo "== 3. List messages =="
curl -s -X POST "$BASE/rest/forum/list" \
  -H 'Content-Type: application/json' \
  -d "{\"token\":{\"jwt\":\"$JWT\"},\"eventId\":\"$EVENT_ID\"}"
echo; echo

echo "== 4. Cleanup (should be FORBIDDEN from outside cron) =="
curl -s "$BASE/rest/forum/cleanup"
echo
