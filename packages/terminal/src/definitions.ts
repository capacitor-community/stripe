export interface StripeTerminalPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
