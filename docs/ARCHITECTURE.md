# Architecture

## Product boundary

This repository is the **mobile/web client**. It must not depend on another project's production server for an independently branded deployment.

```text
OpenCircle Expo client
│
├── Browse / Swipe
│   └── Alovoa-compatible search + like/hide API
├── Social
│   └── Alovoa-compatible alerts/activity API
├── DMs
│   └── Alovoa-compatible conversations + text message API
├── Profiles
│   └── Alovoa-compatible profile/settings/media API
└── Cam2Cam
    └── Configurable Jitsi-compatible room URL

Configured backend
├── Authentication
├── User/profile data
├── Matching
├── Search/location
├── Notifications
├── Text conversations
└── Moderation/account controls
```

## Runtime configuration

`app.config.js` injects public runtime values into Expo `extra`. `config/runtime.ts` is the single client-side source for:

- application display name;
- API base URL;
- video-room base URL;
- source repository metadata.

`URL.tsx` builds every backend endpoint from that configured API base. There is no hard-coded production Alovoa domain in the API layer.

## Navigation

The MVP bottom navigation is:

```text
Browse → Swipe → Social → Cam2Cam → DMs → Me
```

Existing Alovoa screens are reused where they are already mature:

- `Search.tsx` -> Swipe
- `Messages.tsx` -> DMs
- `YourProfile.tsx` -> Me

New fork-specific screens are intentionally thin adapters around existing APIs so upstream fixes remain easier to merge.

## Video calling

The MVP does not bundle a proprietary calling SDK. It creates deterministic or shareable room names and opens the configured Jitsi-compatible provider using `expo-web-browser`.

For a matched conversation, both users derive the same room from the sorted pair of user UUIDs and a one-way hash. The room name does not contain either full UUID directly.

A later native calling layer can replace `lib/videoCall.ts` without changing the rest of the navigation or chat flow.

## Backend extension boundary

The existing Alovoa API is sufficient for the current matching/profile/text-chat MVP. The following are **backend features**, not safe client-only illusions:

- cross-user stories/status posts;
- image/video attachments in DMs;
- presence-aware call invitations and ringing;
- push notifications for incoming calls;
- call history;
- server-enforced media moderation/retention;
- abuse-rate limits for media and calls.

Implement those on a backend fork you operate, version the API, and then add matching client adapters.

## Upgrade strategy

Keep fork-specific code concentrated in:

- `config/`
- `lib/`
- new screens (`Browse`, `Social`, `Cam2Cam`)
- small integration changes in `Main`, `Login`, and `MessageDetail`

This limits merge conflicts when pulling future improvements from `Alovoa/alovoa-expo`.
