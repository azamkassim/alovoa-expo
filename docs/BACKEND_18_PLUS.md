# Server-side 18+ enforcement

The mobile client rejects registration below age 18, but the backend must enforce the same rule independently. Client-side checks can be bypassed by a modified client or direct HTTP request.

## What upstream Alovoa already provides

The upstream server already performs a server-side minimum-age check in `RegisterService.registerBase(...)`. Both normal email registration and OAuth registration call that common method.

`RegisterService` injects:

```java
@Value("${app.age.min}")
private int minAge;
```

and rejects the request when:

```java
int userAge = Tools.calcUserAge(dto.getDateOfBirth());
if (userAge < minAge) {
    throw new AlovoaException(publicService.text("backend.error.register.min-age"));
}
```

The same value is also used when constructing the user's initial preferred-age range.

## Required OpenCircle backend change

At the upstream revision inspected for this fork, `src/main/resources/application.properties` contains:

```properties
app.age.min=16
```

For an OpenCircle deployment, change the effective backend value to:

```properties
app.age.min=18
```

If configuration is supplied by the deployment environment rather than the file, set the equivalent Spring Boot environment value:

```text
APP_AGE_MIN=18
```

The important requirement is the **effective runtime value**, not where it is stored.

## Why no Java fork-specific age validator is necessary

A new controller or duplicate age-check service would add redundant policy logic. The canonical owner already exists: `RegisterService.registerBase(...)`. Configure its existing `app.age.min` input to 18 instead of duplicating the check elsewhere.

## Verification

Before public release, verify both registration paths directly against the owned backend, not only through the mobile UI:

1. Email registration with an age of 17 must be rejected.
2. Email registration with an age of 18 must proceed to the normal validation/confirmation flow.
3. OAuth registration with an age of 17 must be rejected.
4. OAuth registration with an age of 18 must proceed normally.
5. A direct HTTP request that bypasses the mobile client must still be rejected below 18.
6. Restart the backend and repeat one under-18 test to confirm the deployment configuration is actually loaded.

## Release gate

Do not mark the server-side 18+ gate complete merely because the frontend shows “Adults 18+ only.” It is complete only after the owned backend is running with an effective `app.age.min=18` and the direct-request checks above pass.
