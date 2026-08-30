# OpenCircle release gate

A public build is **NO-GO** until every mandatory item below is satisfied. This keeps the fork independent from Alovoa production infrastructure and prevents an APK from being treated as production-ready merely because it compiles.

## Mandatory technical gates

- [ ] GitHub Actions is enabled on the fork.
- [ ] `type-check`, dependency/Expo validation and Android release build complete successfully from the current commit.
- [ ] A release APK artifact is produced from the repository workflow.
- [ ] `EXPO_PUBLIC_API_URL` points to an HTTPS Alovoa-compatible backend controlled by the deployment owner.
- [ ] `EXPO_PUBLIC_ALLOW_CLEARTEXT` is absent or `false` in release builds.
- [ ] Registration, login, logout and password reset work against the owned backend.
- [ ] Browse, swipe, like/hide, match, DMs and profile loading work against the owned backend.
- [ ] Block and report controls are tested end-to-end.
- [ ] Location denial and backend/network failure paths do not crash the client.

## Safety and privacy gates

- [ ] The backend independently enforces an **18+ registration floor**. Client-side DOB checks are not sufficient.
- [ ] Terms of Service and Privacy Policy URLs on the owned backend are complete and accurate.
- [ ] Data retention, account deletion and user-data export behavior are documented and tested.
- [ ] Location precision and retention are minimized to what discovery actually needs.
- [ ] Reporting/moderation ownership and response process are defined before inviting public users.
- [ ] Video provider authentication, logging and retention are reviewed. A room code is not treated as a password.
- [ ] Public distribution does not use another project's backend, OAuth credentials, package IDs, trademarks or proprietary store artwork.

## Product gates

- [ ] Final product name and package identifiers are approved; `OpenCircle` remains a working name until then.
- [ ] Store metadata and screenshots represent this fork rather than upstream Alovoa.
- [ ] No coin/VIP/paywall gate is introduced around the core matching, profile and text-chat functions promised by this fork.
- [ ] Stories, media DMs and push/native call signalling are labelled unavailable until their server-side implementation is complete and tested.

## Release decision

Only after all mandatory gates are checked should `master` be tagged for a public release. Until then, feature builds are development/test artifacts only.
