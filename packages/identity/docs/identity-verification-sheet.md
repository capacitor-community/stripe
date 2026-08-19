---
title: 'Identity Verification Sheet'
code: ['identity-verification-sheet/example.ts.md']
scrollActiveLine:
  [
    { id: '', activeLine: { ['example.ts']: [1, 1] } },
    { id: 'listen-for-the-result', activeLine: { ['example.ts']: [5, 18] } },
    { id: 'obtain-session-credentials', activeLine: { ['example.ts']: [31, 34] } },
    { id: 'initialize-the-web-platform', activeLine: { ['example.ts']: [27, 31] } },
    { id: 'create-and-present-the-sheet', activeLine: { ['example.ts']: [34, 42] } },
    { id: 'handle-failedtoload', activeLine: { ['example.ts']: [18, 27] } },
    { id: 'handle-verificationresult', activeLine: { ['example.ts']: [5, 18] } },
    { id: 'errors-and-cancellation', activeLine: { ['example.ts']: [5, 18] } },
  ]
---

Stripe Identity verifies identity documents in a native sheet on iOS and Android, and through Stripe.js on the web, while keeping the application code in Capacitor.

The plugin supports iOS, Android, and Web. Native platforms present Stripe's Identity Verification Sheet with `verificationId` and `ephemeralKeySecret`. Web calls `verifyIdentity` with `clientSecret` after `initialize`.

## Listen for the result

Register the result listener once during application startup and before calling `present()`. Android can recreate the Activity and JavaScript runtime while the native sheet is open, so early registration prevents a delivered result from being missed.

Keep the listener for the lifetime of its application-level owner—for example `main.ts`, an application initializer, or a singleton service initialized at startup. Do not remove it immediately after `present()` returns. On Android, `present()` resolves as soon as the sheet is shown; the outcome arrives later through `VerificationResult`.

`Completed`, `Canceled`, and `Failed` are result values delivered on `IdentityVerificationResult.result`. They are not separately supported `addListener` overloads. Register `IdentityVerificationSheetEventsEnum.VerificationResult` and inspect `result`.

!::IdentityVerificationSheetEventsEnum::

The native result handoff is kept in memory. It does not guarantee recovery after operating-system process termination.

## Obtain session credentials

Create a VerificationSession on your backend with the Stripe secret key. Then create an ephemeral key for that session and return only client-safe fields.

The official demo server (`POST /identify`) creates a `document` VerificationSession, creates an ephemeral key with `{ verification_session: session.id }` and Stripe API version `2022-11-15`, and responds with:

| Response field         | Source                              | Plugin `create` option |
| ---------------------- | ----------------------------------- | ---------------------- |
| `verificationId`      | `VerificationSession.id`            | `verificationId`       |
| `ephemeralKeySecret`   | `EphemeralKey.secret`               | `ephemeralKeySecret`   |
| `clientSecret`         | `VerificationSession.client_secret` | `clientSecret`         |

```ts
const session = await stripe.identity.verificationSessions.create({
  type: 'document',
});
const ephemeralKey = await stripe.ephemeralKeys.create(
  { verification_session: session.id },
  { apiVersion: '2022-11-15' },
);

return {
  verificationId: session.id,
  ephemeralKeySecret: ephemeralKey.secret,
  clientSecret: session.client_secret,
};
```

Keep the Stripe secret key on the server. The Capacitor app should receive only the publishable key (web `initialize`) plus `verificationId`, `ephemeralKeySecret`, and `clientSecret`. Never ship `STRIPE_SECRET_KEY` in the client, native binary, or frontend bundle.

`Completed` on the device means the user finished uploading documents. The VerificationSession then moves to processing. Confirm the official outcome on the server with Identity webhooks such as `identity.verification_session.verified`, `identity.verification_session.requires_input`, `identity.verification_session.processing`, `identity.verification_session.canceled`, and `identity.verification_session.redacted`. See [Handle verification outcomes](https://docs.stripe.com/identity/handle-verification-outcomes).

## Initialize the web platform

`initialize` is required only when running on the web. It loads Stripe.js with the publishable key. Native `initialize` resolves without using that key.

!::initialize::

## Create and present the sheet

Pass the backend fields into `create`, then call `present()`.

- **iOS and Android** require `verificationId` and `ephemeralKeySecret`. Missing either value rejects `create` and emits `FailedToLoad`.
- **Web** uses `clientSecret` only. Native platforms ignore `clientSecret`. Omit it on native builds if you want; include it when the same code runs on web.
- Do not import `CreateIdentityVerificationSheetOption` or `InitializeIdentityVerificationSheetOption` from `@capacitor-community/stripe-identity`. Those option types are not re-exported from the package index.

!::create::

!::CreateIdentityVerificationSheetOption::

!::present::

`present()` returns `Promise<void>`. It does not return `IdentityVerificationResult`. Read the outcome from the `VerificationResult` listener.

## Handle FailedToLoad

`FailedToLoad` fires when `create` cannot build the sheet. The `create` promise also rejects with the same text.

Native platforms emit it when `verificationId` or `ephemeralKeySecret` is missing (`Invalid Params. This method require verificationId or ephemeralKeySecret.` on Android; iOS uses the same sentence with a lowercase `this`). iOS also emits it when the primary app icon keys are missing from `Info.plist`.

The listener type is `StripeIdentityError`. iOS delivers `{ message }`. Android currently puts the text on `error` as a string. Handle both the listener and the rejected `create` promise.

Web `create` always emits `Loaded` and does not validate `clientSecret`. Web `present` throws `Stripe is not initialized.` or `clientSecret is not set.` instead of `FailedToLoad`.

!::StripeIdentityError::

## Handle VerificationResult

`IdentityVerificationResult.result` is `IdentityVerificationSheetResultInterface`: `Completed`, `Canceled`, or `Failed`.

| `result`    | Meaning                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `Completed` | The user submitted documents. Verification is still processing; wait for webhooks.                                                     |
| `Canceled`  | The user dismissed the sheet. Allow them to try again. On web this is Stripe.js `session_cancelled`.                                   |
| `Failed`    | The flow failed. Read `error.message` and show it. Native platforms send the localized failure text; web forwards the Stripe.js error. |

`error` is present on `Failed`. Do not register `addListener(IdentityVerificationSheetEventsEnum.Completed)`, `Canceled`, or `Failed`. Those enum members are result values, not supported listener names.

!::IdentityVerificationResult::

!::IdentityVerificationSheetResultInterface::

## Errors and cancellation

Treat cancellation as a user action, not a crash: keep the listener registered and allow another `create` / `present` cycle.

`present()` behavior differs by platform:

- **Android** resolves when the sheet is presented. A later `VerificationResult` (retained in memory until consumed) reports `Completed`, `Canceled`, or `Failed`. A thrown present error rejects the promise.
- **iOS** waits until the sheet closes, notifies `VerificationResult`, then resolves `present()`.
- **Web** waits for `verifyIdentity`. Cancellation and failure notify `VerificationResult` and resolve. Missing `initialize` or `clientSecret` rejects.

Do not infer success from `present()` resolving. Always branch on `verification.result`.
