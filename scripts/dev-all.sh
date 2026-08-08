#!/usr/bin/env bash
set -euo pipefail

TIMEOUT=120

echo "Starting docker-compose..."
docker-compose up -d

START=$(date +%s)

# Detect DB type from .env (DATABASE_URL)
DB_URL=""
if [ -f .env ]; then
  DB_URL=$(grep '^DATABASE_URL=' .env | head -n1 | cut -d '=' -f2- | tr -d '"') || true
fi

PORT=27017
if echo "$DB_URL" | grep -qi 'postgres'; then
  PORT=5432
fi

echo "Waiting for DB on 127.0.0.1:$PORT (detected from DATABASE_URL: $DB_URL)"

while true; do
  if nc -z 127.0.0.1 $PORT >/dev/null 2>&1; then
    echo "DB is up on port $PORT"
    break
  fi
  NOW=$(date +%s)
  ELAPSED=$((NOW-START))
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "Timed out waiting for Postgres after $TIMEOUT seconds" >&2
    exit 1
  fi
  echo "Waiting for DB on 127.0.0.1:$PORT..."
  sleep 2
done

echo "Starting dev server (pnpm run dev)..."
pnpm run dev

echo "If we timed out, gathering docker diagnostics..."
if ! nc -z 127.0.0.1 $PORT >/dev/null 2>&1; then
  echo "--- docker ps ---"
  docker ps || true
  echo "--- docker-compose ps ---"
  docker-compose ps || true
  echo "--- Logs: postgres ---"
  docker-compose logs postgres --tail 200 || true
  echo "--- Logs: payload ---"
  docker-compose logs payload --tail 200 || true
fi
