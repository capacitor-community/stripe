import {ITestItems} from '../shared/interfaces';
import {TerminalEventsEnum} from '@capacitor-community/stripe-terminal';

export const checkDiscoverMethodItems: ITestItems[] = [
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
    name: 'getConnectedReader',
  },
  {
    type: 'method',
    name: 'disconnectReader',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.DisconnectedReader,
  },
];
