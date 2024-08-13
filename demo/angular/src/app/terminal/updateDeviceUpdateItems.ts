import {ITestItems} from '../shared/interfaces';
import {TerminalEventsEnum} from '@capacitor-community/stripe-terminal';

export const updateDeviceUpdateItems: ITestItems[] = [
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
    name: 'setSimulatorConfiguration:UPDATE_AVAILABLE',
  },
  {
    type: 'event',
    name: TerminalEventsEnum.ReportAvailableUpdate,
  },
  {
    type: 'method',
    name: 'installAvailableUpdate',
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
    type: 'method',
    name: 'cancelInstallUpdate',
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
