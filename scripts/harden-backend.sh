#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-../opencircle-backend}"
PROPS="$TARGET/src/main/resources/application.properties"

if [ ! -f "$PROPS" ]; then
  echo "ERROR: Alovoa application.properties not found at: $PROPS" >&2
  echo "Pass the root of an Alovoa-compatible backend checkout." >&2
  exit 1
fi

if ! grep -q '^app\.age\.min=' "$PROPS"; then
  echo "ERROR: app.age.min is missing from $PROPS" >&2
  echo "Upstream configuration may have changed; review it before continuing." >&2
  exit 1
fi

# OpenCircle is adult-only. Keep the existing RegisterService as the canonical
# server-side validator and change only its configured minimum age.
sed -i 's/^app\.age\.min=.*/app.age.min=18/' "$PROPS"

if ! grep -qx 'app.age.min=18' "$PROPS"; then
  echo "ERROR: failed to enforce app.age.min=18" >&2
  exit 1
fi

cat <<EOF
Backend baseline hardened:
  target: $TARGET
  app.age.min=18: PASS

This changes source configuration only. Before public use, still configure your
own database, SMTP/OAuth credentials, encryption keys, HTTPS domain, legal
pages, branding/assets, moderation process and retention settings.
EOF
