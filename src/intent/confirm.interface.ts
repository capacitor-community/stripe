import type {ApplePayOptions} from '../applepay';
import type {CommonIntentOptions} from '../definitions';
import type {GooglePayOptions} from '../googlepay';

export interface ConfirmPaymentIntentOptions extends CommonIntentOptions {
  /**
   * Indicates that you intend to make future payments with this PaymentIntent's payment method.
   *
   * If present, the payment method used with this PaymentIntent can be [attached](https://stripe.com/docs/api/payment_methods/attach) to a Customer, even after the transaction completes.
   *
   * Use `on_session` if you intend to only reuse the payment method when your customer is present in your checkout flow. Use `off_session` if your customer may or may not be in your checkout flow.
   *
   * Stripe uses `setup_future_usage` to dynamically optimize your payment flow and comply with regional legislation and network rules. For example, if your customer is impacted by [SCA](https://stripe.com/docs/strong-customer-authentication), using `off_session` will ensure that they are authenticated while processing this PaymentIntent. You will then be able to collect [off-session payments](https://stripe.com/docs/payments/cards/charging-saved-cards#off-session-payments-with-saved-cards) for this customer.
   *
   * If `setup_future_usage` is already set and you are performing a request using a publishable key, you may only update the value from `on_session` to `off_session`.
   */
  setupFutureUsage?: 'on_session' | 'off_session';
  /**
   * Whether you intend to save the payment method to the customer's account after this payment
   */
  saveMethod?: boolean;

  /**
   * If provided, the payment intent will be confirmed using Apple Pay
   */
  applePayOptions?: ApplePayOptions;

  /**
   * If provided, the payment intent will be confirmed using Google Pay
   */
  googlePayOptions?: GooglePayOptions;
}
