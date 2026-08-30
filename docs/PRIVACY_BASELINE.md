# Privacy and safety baseline

This checklist is the minimum expected before a public deployment.

## Data ownership and service boundaries

- Run the social backend under an account/infrastructure you control.
- Do not ship a rebranded client that silently uses another community's production API.
- Publish accurate Terms, Privacy and contact/imprint pages on the configured backend.
- Document every third-party processor, including video infrastructure, email and push services.

## Authentication and secrets

- Never commit database, SMTP, OAuth, encryption or signing secrets to this repository.
- Keep authentication/session material in platform secure storage where supported.
- Use HTTPS for internet-facing API traffic.
- Rotate keys and credentials after any suspected exposure.
- Disable unused OAuth providers instead of leaving incomplete configurations exposed.

## Location

- Request foreground location only when discovery needs it.
- Do not collect background location for this product without a new explicit use case and consent review.
- Prefer distance/radius display over exposing exact coordinates to other users.
- Rate-limit location updates server-side.

## Profiles and moderation

- Preserve block and report controls.
- Provide an underage-report path and enforce the service's age policy server-side.
- Add server-side abuse throttles for account creation, likes, messages and media.
- Keep verification claims precise: community verification is not the same as identity verification.

## Video calls

- The MVP opens a configured Jitsi-compatible service in a browser session.
- Room codes should not be treated as passwords.
- For production, self-host or contract a video provider with reviewed retention, logging and abuse controls.
- Add lobby/authentication controls if the chosen provider supports them.
- Do not record calls by default.

## Media and future Stories

Before enabling cross-user image/video DMs or Stories:

- define maximum file size and type allowlists;
- scan uploads and strip unnecessary metadata where practical;
- store media behind authorization checks rather than predictable public URLs;
- define retention/deletion rules;
- enforce block/report decisions across media delivery;
- implement abuse-rate limits;
- create a moderation/escalation path.

## Release checks

- [ ] API URL belongs to the deployment owner.
- [ ] HTTPS enabled for public API.
- [ ] Privacy/TOS/contact pages are deployment-specific.
- [ ] Google/Facebook OAuth redirect URIs match the new app scheme/domain, or providers are disabled.
- [ ] App package/bundle IDs are unique.
- [ ] Branding does not imply endorsement by Alovoa or Brader.
- [ ] Video provider privacy settings reviewed.
- [ ] Block/report tested end-to-end.
- [ ] Account deletion and user-data export tested.
- [ ] Location permission denial tested.
- [ ] Logs reviewed to confirm passwords/session tokens are not printed.
