#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-../opencircle-backend}"
BACKEND_REPO="${BACKEND_REPO:-https://github.com/Alovoa/alovoa.git}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# Apply only the non-secret safety baseline that can be owned here. The existing
# RegisterService remains the canonical server-side age validator.
"$SCRIPT_DIR/harden-backend.sh" "$TARGET"

cat <<EOF

Backend source cloned and baseline-hardened at:
  $TARGET

Next steps:
  1. Read $TARGET/README.md and $TARGET/DOCUMENTATION.md.
  2. Configure MariaDB, email and required application/encryption values locally.
  3. Replace upstream web/email branding and restricted assets before public distribution.
  4. Do not commit real credentials or encryption keys.
  5. Start the backend using its documented Maven or Docker Compose workflow.
  6. Directly verify under-18 registration is rejected for email and OAuth flows.
  7. Set this frontend's EXPO_PUBLIC_API_URL to that server and restart Expo.

For public deployment, use HTTPS and complete docs/RELEASE_GATE.md first.
EOF
