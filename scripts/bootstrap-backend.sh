#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-../opencircle-backend}"
BACKEND_REPO="${BACKEND_REPO:-https://github.com/Alovoa/alovoa.git}"

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git is required." >&2
  exit 1
fi

if [ -e "$TARGET" ]; then
  echo "ERROR: target already exists: $TARGET" >&2
  echo "Choose an empty path so this script never overwrites backend work." >&2
  exit 1
fi

echo "Cloning compatible backend source..."
git clone --depth 1 "$BACKEND_REPO" "$TARGET"

cat <<EOF

Backend source cloned to:
  $TARGET

Next steps:
  1. Read $TARGET/README.md and $TARGET/DOCUMENTATION.md.
  2. Configure MariaDB, email and required application/encryption values locally.
  3. Do not commit real credentials or encryption keys.
  4. Start the backend using its documented Maven or Docker Compose workflow.
  5. Set this frontend's EXPO_PUBLIC_API_URL to that server and restart Expo.

For public deployment, use HTTPS and review docs/PRIVACY_BASELINE.md first.
EOF
