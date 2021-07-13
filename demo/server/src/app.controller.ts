import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Stripe } from 'stripe';

@Controller()
export class AppController {
  private stripe: Stripe;
  constructor(private readonly appService: AppService) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.stripe = require('stripe')('sk_test_BpbfN6DaB1VhEDVMlLg33IIL');
  }

  @Post('payment-sheet')
  async createPaymentSheet(): Promise<{
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
  }> {
    /**
     * https://stripe.com/docs/payments/accept-a-payment?platform=ios
     */
    const customer = await this.stripe.customers.create();
    const ephemeralKey = await this.stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2020-08-27'}
    );
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: 1099,
      currency: 'usd',
      customer: customer.id,
    });
    return {
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id
    }
  }
}
