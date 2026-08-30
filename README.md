# OpenCircle mobile — working fork

OpenCircle is the working name for this fork of the Alovoa Expo client. The goal is an open social/matching app where core features are available by design rather than hidden behind coins, VIP tiers, or paid swipe/chat gates.

This repository does **not** bypass another app's subscription system. It is an independent client foundation built from open-source Alovoa code and intended to run against a backend you control.

## MVP feature set

- **Browse** — grid discovery using the configured backend search API.
- **Swipe** — the existing Alovoa swipe/match flow.
- **Social** — activity feed for likes/match notifications from the backend.
- **Cam2Cam** — shareable video rooms using a configurable Jitsi-compatible URL.
- **DMs** — existing matched-user chat plus a deterministic video-call button for each conversation.
- **Me** — profile, photos, prompts, search preferences, verification, block/report and account controls inherited from Alovoa.
- **No premium gate** — the client contains no coin/VIP requirement around these core features.

## Important backend rule

The client no longer defaults to `https://alovoa.com`. It defaults to:

```text
http://localhost:8080
```

Set `EXPO_PUBLIC_API_URL` to the Alovoa-compatible server that you operate. Do not distribute a rebranded build pointed at another project's production service.

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

## Android APK

The repository includes a GitHub Actions workflow that prebuilds the Android project and produces a release APK artifact on pull requests. No EAS account is required for that CI path.

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

For production privacy/control, operate your own compatible Jitsi deployment and review its logging, retention and moderation settings.

## Runtime configuration

See [`.env.example`](.env.example). The most important values are:

- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_APP_SLUG`
- `EXPO_PUBLIC_APP_SCHEME`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_VIDEO_BASE_URL`
- `ANDROID_PACKAGE`
- `IOS_BUNDLE_IDENTIFIER`

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for boundaries and [`docs/PRIVACY_BASELINE.md`](docs/PRIVACY_BASELINE.md) for the minimum privacy/safety controls expected before public release.

## Remaining backend-dependent enhancements

The current Alovoa API supports matching, profiles and text chat. True cross-user **Stories**, **media/video attachments in DMs**, push-native call signalling and fully in-app WebRTC require server-side additions. Those should be implemented on a backend fork you control rather than simulated only in the client.

## Licensing

This fork keeps the original repository's license files. The mobile code is primarily MPL-2.0, with older portions under the license documented in `LICENSE_old`. Review file-level licensing before redistribution.

The Alovoa backend is a separate AGPL-3.0 project. Its upstream README also notes separate restrictions for some image assets; do not assume all upstream visual branding can be reused in a newly branded public product.
