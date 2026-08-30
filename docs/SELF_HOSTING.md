# Self-hosting an Alovoa-compatible backend

The mobile client needs a backend for accounts, search, matching, profiles, notifications and DMs. The quickest compatible starting point is the upstream Alovoa server.

Upstream source:

```text
https://github.com/Alovoa/alovoa
```

The upstream server is licensed separately under AGPL-3.0. Its README also notes separate restrictions for some images, so review licensing before redistributing backend assets under a new brand.

## 1. Bootstrap a working copy

From this frontend repository:

```bash
./scripts/bootstrap-backend.sh
```

By default the script clones the upstream server into `../opencircle-backend`. You can choose another target:

```bash
./scripts/bootstrap-backend.sh ~/projects/opencircle-backend
```

The script intentionally does not copy secrets or fabricate production configuration.

## 2. Backend prerequisites

According to the upstream build instructions, prepare:

- OpenJDK 17;
- Maven, or Docker + Docker Compose;
- MariaDB;
- an email/SMTP configuration suitable for registration and account flows;
- application encryption/configuration values required by the server.

Read the upstream `README.md`, `DOCUMENTATION.md`, `docker-compose.yml` and application configuration examples for the exact version you cloned.

## 3. Configure secrets locally

Do **not** commit real values to either repository. Configure database credentials, email credentials, OAuth credentials and encryption keys through your chosen secret-management method or a local ignored configuration file.

For a public service:

- use a dedicated database user with least privilege;
- use strong unique encryption keys;
- require HTTPS at the reverse proxy/load balancer;
- restrict database exposure to the application network;
- back up the database and test restores;
- configure mail reputation and abuse limits.

## 4. Start the server

The upstream project documents both Maven and Docker Compose workflows. A typical development workflow is either:

```bash
mvn install
```

or, after completing required application configuration:

```bash
docker-compose build
docker-compose up -d
docker-compose logs -f
```

Use the commands supported by the exact upstream revision you cloned.

## 5. Point the mobile client at it

Create `.env` in this frontend repository:

```text
EXPO_PUBLIC_API_URL=http://YOUR_BACKEND_HOST:8080
```

Examples:

```text
# Android emulator -> host development machine
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080

# Physical phone on the same Wi-Fi
EXPO_PUBLIC_API_URL=http://192.168.1.50:8080

# Public production service
EXPO_PUBLIC_API_URL=https://api.example.com
```

Then rebuild/restart Expo so the value is included in `app.config.js` runtime extras.

## 6. OAuth and deep links

This fork uses the default app scheme `opencircle://`. If Google or Facebook sign-in is enabled, configure the backend and provider consoles for your own package/bundle identifiers, domain and redirect flow.

Do not assume OAuth settings belonging to `alovoa.com` will work for a newly branded deployment.

## 7. Video service

Video rooms are independent from the Alovoa API in the MVP. The default is `https://meet.jit.si`.

For a controlled deployment:

```text
EXPO_PUBLIC_VIDEO_BASE_URL=https://meet.example.com
```

Self-hosted Jitsi is recommended when you need control over authentication, logging, retention and moderation policy.

## 8. Backend features still needed for the broader social roadmap

The current compatible server covers the matching/profile/text-chat MVP. Add versioned backend endpoints before shipping:

- Stories/status posts;
- image/video DM attachments;
- native call invitations/ringing;
- push signalling;
- media authorization and retention;
- media abuse throttles and moderation workflow.

Keep these changes on a backend fork you control and comply with AGPL source-availability obligations for network use.
