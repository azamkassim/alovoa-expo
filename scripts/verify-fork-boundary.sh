#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "BOUNDARY CHECK FAILED: $1" >&2
  exit 1
}

pass() {
  echo "PASS: $1"
}

# The rebranded client may understand/detect upstream Alovoa hosts, but it must
# not use them as its canonical API endpoint.
if grep -Eq 'export const DOMAIN[^\n]*https://([a-z0-9-]+\.)?alovoa\.com' URL.tsx; then
  fail "URL.tsx still exports an upstream Alovoa production API as DOMAIN"
fi
pass "no hard-coded upstream production DOMAIN in URL.tsx"

grep -q 'API_BASE_URL' URL.tsx \
  || fail "URL.tsx is not derived from the runtime API base URL"
pass "API routes derive from runtime configuration"

grep -q 'IS_ALOVOA_PRODUCTION' screens/Login.tsx \
  || fail "login screen no longer guards upstream Alovoa service hosts"
pass "upstream service-host guard present"

grep -q 'const MIN_AGE = 18;' screens/Register.tsx \
  || fail "client registration floor is not 18"
pass "client 18+ registration floor present"

grep -q 'export const FLAG_ENABLE_DONATION = false;' Global.tsx \
  || fail "legacy donation surface is enabled"
pass "legacy donation surface disabled"

grep -q 'com.azamkassim.opencircle' app.config.js \
  || fail "independent package identifier default is missing"
pass "independent package identifier default present"

grep -q 'EXPO_PUBLIC_ALLOW_CLEARTEXT' plugins/setClearTextTrafficFalse.js \
  || fail "cleartext policy is no longer explicit/opt-in"
pass "cleartext policy remains explicit and opt-in"

grep -q 'createRandomRoom' screens/MessageDetail.tsx \
  || fail "DM video invites no longer use per-call random rooms"
pass "DM video invite uses per-call random room"

if [ -e fastlane/metadata/android/en-US/images/phoneScreenshots/p1.png ]; then
  fail "upstream-branded store screenshot still exists"
fi
pass "upstream-branded store screenshot removed"

echo "Independent fork boundary checks complete."
