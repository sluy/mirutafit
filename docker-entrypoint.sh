#!/bin/sh
set -e

# Apply any pending database migrations before the app boots.
# Safe to run on every deploy: `migrate deploy` only applies new migrations.
echo "→ Applying database migrations..."
# Invoke the real CLI entry (not the .bin symlink) so Prisma's sibling
# *.wasm files resolve correctly.
node node_modules/prisma/build/index.js migrate deploy

echo "→ Starting Next.js server..."
exec node server.js
