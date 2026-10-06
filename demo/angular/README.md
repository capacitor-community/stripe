# Angular Stripe demo

## Run the Billing demo on iOS

Billing is an optional iOS-only package. The **BILLING** tab is visible on web and
Android with an unsupported-platform message; it never pretends to complete a purchase.

1. Configure and start [the demo Worker](../server/README.md#billing-demo-private-preview-test-mode-only).
2. Point `src/environments/environment.ts` at that Worker. Use
   `http://localhost:3000/` for the iOS simulator, or an HTTPS development endpoint
   reachable from your physical device. Production builds use `environment.prod.ts`.
3. From the repository root, run `npm ci` and `npm run build`.
4. From `demo/angular`, run:

   ```sh
   npm ci
   npm run build -- --configuration development
   npx cap sync ios
   npx cap open ios
   ```

5. Run the app with Swift Package Manager in Xcode and open the **BILLING** tab.
   Enter `BILLING_DEMO_TOKEN`; it is kept only in memory and cleared on reset.

## Manual verification

- **Connect** loads the server's test publishable key, Buy Button ID, and entitlement
  lookup key. Bad credentials or an unconfigured server show an error.
- **Load buy button** displays its metadata. **Present buy button** shows the native
  SDK button; tap it to open test checkout. Closing the sheet is not proof of payment.
- After checkout, close the native sheet and use **Refresh entitlements** and
  **Check feature access**. The session-request counter confirms that the app
  supplied Customer Sessions from the backend, including subsequent refreshes.
- **Customer Portal** opens the in-app portal. **External portal** opens the browser;
  refresh entitlements after returning. Subscription changes can take time to appear.
- **Reset / sign out** clears the native session, token, listeners and displayed
  results. Reconnect to verify a new session. To test a different customer, reset
  first, change `BILLING_CUSTOMER_ID` on the Worker, and reconnect.

Only non-secret button/entitlement data is displayed. Network or authorization
failures are passed to the SDK as failures, never as permission for anonymous checkout.
A preview-enabled Stripe account is required; this demo does not bypass preview enrollment.
