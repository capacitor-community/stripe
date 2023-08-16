export interface StripeIdentityPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
