# Backend extension contract

This document defines the smallest server-side additions needed for features that the current Alovoa-compatible API does not provide. It is a contract for a future backend fork, not a claim that these endpoints already exist.

## Principles

1. Extend the owned Alovoa-compatible backend; do not bolt on a second identity, matching or chat database.
2. Existing user UUIDs and conversation IDs remain canonical identifiers.
3. Block/report decisions must apply to every new surface.
4. Media is private by default and must use authenticated authorization checks rather than guessable public object URLs.
5. Metadata and media retention must be explicit and deletable.

## Stories

Suggested resource model:

```text
Story
- id
- ownerUuid
- createdAt
- expiresAt
- mediaType: image | video
- mediaRef
- caption
```

Suggested API shape:

```text
GET    /api/v1/resource/stories
POST   /user/story/add
DELETE /user/story/delete/{storyId}
```

`GET` must exclude blocked users in both directions and expired stories. `POST` must validate MIME type, size and ownership. `DELETE` must remove the database record and queue physical media deletion.

## Media in DMs

Extend the existing conversation rather than create a second messenger.

Suggested message additions:

```text
MessageDto
- type: text | image | video
- mediaRef?: string
- thumbnailRef?: string
- mimeType?: string
- sizeBytes?: number
```

Suggested upload endpoint:

```text
POST /message/send-media/{conversationId}
```

The server must verify that the current user belongs to the conversation and that the recipient has not blocked the sender. Media download must require the same authorization.

## Video-call signalling

The MVP uses the existing text-message channel to send a Jitsi-compatible room invite. That gives the recipient a visible, tappable invitation without introducing a new signalling service.

A later push/native calling implementation can add ephemeral call state:

```text
POST /call/invite/{conversationId}
POST /call/accept/{callId}
POST /call/decline/{callId}
POST /call/end/{callId}
GET  /api/v1/resource/calls/pending
```

The server should store only the minimum state required for delivery/audit and expire stale calls quickly. Do not store raw WebRTC media.

## Capability discovery

Before the mobile client exposes server-dependent features, add one versioned capability resource, for example:

```json
{
  "apiVersion": 1,
  "stories": false,
  "mediaMessages": false,
  "nativeCallSignalling": false
}
```

Suggested endpoint:

```text
GET /api/v1/resource/capabilities
```

The client should hide unsupported functionality rather than issue failing requests.

## Acceptance checks

A backend extension is not complete until authorization tests cover unauthenticated access, another user's media, blocked-user relationships, expired/deleted media, invalid MIME/size, and conversation membership. Server-side 18+ registration enforcement remains mandatory regardless of client validation.
