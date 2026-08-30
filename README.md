# OpenCircle mobile — working fork

OpenCircle is the working name for this fork of the Alovoa Expo client. The goal is an open social/matching app where core features are available by design rather than hidden behind coins, VIP tiers, or paid swipe/chat gates.

This repository does **not** bypass another app's subscription system. It is an independent client foundation built from open-source Alovoa code and intended to run against a backend you control.

## MVP feature set

- **Browse** — grid discovery using the configured backend search API.
- **Swipe** — the existing Alovoa swipe/match flow.
- **Social** — activity feed for likes/match notifications from the backend.
- **Cam2Cam** — shareable video rooms using a configurable Jitsi-compatible URL.
- **DMs** — existing matched-user chat plus a per-call random video-room invite sent through the conversation before the room opens.
- **Me** — profile, photos, prompts, search preferences, verification, block/report and account controls inherited from Alovoa.
- **No premium gate** — the client contains no coin/VIP requirement around these core features.
- **18+ client floor** — registration rejects dates of birth below 18; the owned backend must enforce the same rule independently before public release.

## Important backend rule

The client no longer defaults to `https://alovoa.com`. It defaults to:

```text
http://localhost:8080
```

Set `EXPO_PUBLIC_API_URL` to the Alovoa-compatible server that you operate. Do not distribute a rebranded build pointed at another project's production service. The login screen also disables account actions when the configured API host is an upstream `alovoa.com` service.

## Quick start

```bash
cp .env.example .env
# Edit EXPO_PUBLIC_API_URL for your server.
yarn install --frozen-lockfile
yarn start
```

For a phone on the same Wi-Fi as your development machine, the API URL normally needs the machine's LAN address, for example:

```text
EXPO_PUBLIC_API_URL=http://192.168.1.50:8080
```

Android emulator users can normally use `http://10.0.2.2:8080` for a backend running on the host machine.

Android blocks clear-text HTTP in the generated app by default. For **local development only**, if your backend does not yet use TLS, add:

```text
EXPO_PUBLIC_ALLOW_CLEARTEXT=true
```

Keep this setting `false` for any public build and use HTTPS for the API.

## Android APK

The repository includes a GitHub Actions workflow that type-checks, lints, runs Expo Doctor, prebuilds Android and produces a release APK artifact. It can run on pull requests, feature-branch pushes, or manually with `workflow_dispatch`. No EAS account is required for that CI path.

GitHub may leave Actions disabled on a newly created fork until the repository owner explicitly enables workflows in the **Actions** tab. If no workflow run appears after a push, enable Actions first and then run the workflow manually or push another commit.

Local native build:

```bash
yarn
./scripts/android.sh
cd android
./gradlew assembleRelease
```

## Self-host the backend

Alovoa's backend is a separate AGPL-3.0 project. See [`docs/SELF_HOSTING.md`](docs/SELF_HOSTING.md) and [`scripts/bootstrap-backend.sh`](scripts/bootstrap-backend.sh).

The upstream backend requires Java 17, MariaDB, email configuration and encryption/application settings. Docker Compose is also supported upstream.

## Video rooms

The default video provider is:

```text
https://meet.jit.si
```

Override it with:

```text
EXPO_PUBLIC_VIDEO_BASE_URL=https://meet.example.com
```

A new random room code is generated for each DM video invite. A room code is still **not a password**. For production privacy/control, operate your own compatible Jitsi deployment and review its authentication, logging, retention and moderation settings.

## Runtime configuration

See [`.env.example`](.env.example). The most important values are:

- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_APP_SLUG`
- `EXPO_PUBLIC_APP_SCHEME`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_ALLOW_CLEARTEXT`
- `EXPO_PUBLIC_VIDEO_BASE_URL`
- `ANDROID_PACKAGE`
- `IOS_BUNDLE_IDENTIFIER`

## Architecture and release controls

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — client boundaries and ownership.
- [`docs/PRIVACY_BASELINE.md`](docs/PRIVACY_BASELINE.md) — minimum privacy/safety controls.
- [`docs/RELEASE_GATE.md`](docs/RELEASE_GATE.md) — mandatory NO-GO/GO checklist before a public build is treated as releasable.
- [`docs/BACKEND_EXTENSIONS.md`](docs/BACKEND_EXTENSIONS.md) — smallest server-side contracts for Stories, media DMs and later native call signalling.

## Remaining backend-dependent enhancements

The current Alovoa API supports matching, profiles and text chat. True cross-user **Stories**, **media/video attachments in DMs**, push-native call signalling and fully in-app WebRTC require server-side additions. Those should be implemented on a backend fork you control rather than simulated only in the client.

## Licensing

This fork keeps the original repository's license files. The mobile code is primarily MPL-2.0, with older portions under the license documented in `LICENSE_old`. Review file-level licensing before redistribution.

The upstream empty-state and onboarding illustrations in this client include their own asset license files. The primary OpenCircle icon, adaptive icon, splash, favicon and store feature graphic in this branch are independent replacement assets.

The Alovoa backend is a separate AGPL-3.0 project. Its upstream README also notes separate restrictions for some image assets; do not assume all upstream visual branding can be reused in a newly branded public product.
