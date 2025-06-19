import { ITestItems } from '../shared/interfaces';
import { TerminalEventsEnum } from '@capacitor-community/stripe-terminal';

export const cancelPathItems: ITestItems[] = [
  {
    type: 'method',
    name: 'initialize',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.Loaded,
  },
  {
    type: 'method',
    name: 'discoverReaders',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.DiscoveredReaders,
  },
  {
    type: 'method',
    name: 'connectReader',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.ConnectedReader,
  },
  {
    type: 'method',
    name: 'HttpClientPaymentIntent',
  },
  {
    type: 'method',
    name: 'collectPaymentMethod',
  },
  {
    type: 'method',
    name: 'cancelCollectPaymentMethod',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.Canceled,
  },
];
