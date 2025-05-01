import { ITestItems } from '../shared/interfaces';
import { TerminalEventsEnum } from '@capacitor-community/stripe-terminal';

export const happyPathItems: ITestItems[] = [
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
    type: 'event',
    name: TerminalEventsEnum.CollectedPaymentIntent,
  },
  {
    type: 'method',
    name: 'confirmPaymentIntent',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.ConfirmedPaymentIntent,
  },
  {
    type: 'event',
    name: TerminalEventsEnum.DisconnectedReader,
  },
];

export const happyPathBluetoothItems: ITestItems[] = [
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
    name: TerminalEventsEnum.DiscoveringReaders,
  },
  {
    type: 'method',
    name: 'connectReader',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.BatteryLevel,
  },
  {
    type: 'event',
    name: TerminalEventsEnum.ConnectedReader,
  },
  // 挿しっぱなしにしてテストするためスキップ
  // {
  //   type: 'event',
  //   name: TerminalEventsEnum.RequestReaderInput,
  // },
  {
    type: 'event',
    name: TerminalEventsEnum.RequestDisplayMessage,
  },
  {
    type: 'event',
    name: TerminalEventsEnum.ReaderEvent,
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
    type: 'event',
    name: TerminalEventsEnum.CollectedPaymentIntent,
  },
  {
    type: 'method',
    name: 'confirmPaymentIntent',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.ConfirmedPaymentIntent,
  },
  {
    type: 'event',
    name: TerminalEventsEnum.DisconnectedReader,
  },
];
