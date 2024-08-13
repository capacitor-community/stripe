import {ITestItems} from '../shared/interfaces';
import {TerminalEventsEnum} from '@capacitor-community/stripe-terminal';

export const updateDeviceRequiredItems: ITestItems[] = [
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
    name: 'setSimulatorConfiguration:REQUIRED',
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
    type: 'event',
    name: TerminalEventsEnum.StartInstallingUpdate,
  },
  {
    type: 'event',
    name: TerminalEventsEnum.ReaderSoftwareUpdateProgress,
  },
  {
    type: 'event',
    name: TerminalEventsEnum.FinishInstallingUpdate,
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
