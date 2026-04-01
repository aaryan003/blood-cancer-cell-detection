#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database (if empty)..."
node prisma/seed.js || echo "Seed skipped or already seeded."

echo "Starting server..."
exec node src/server.js
