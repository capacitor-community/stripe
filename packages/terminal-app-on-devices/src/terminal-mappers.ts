import type { Reader } from '@stripe/terminal-app-on-devices-js/types/terminal-app-on-devices';

import type { Cart, LocationInterface, ReaderInterface } from './definitions';
import { BatteryStatus, DeviceType, LocationStatus, NetworkStatus } from './definitions';
import type { ICart } from './stripe-types/proto';

export const mapFromCartToICart = (cart: Cart): ICart => {
  return {
    line_items: cart.lineItems.map((item) => ({
      description: item.displayName,
      quantity: item.quantity,
      amount: item.amount,
    })),
    tax: cart.tax,
    total: cart.total,
    currency: cart.currency,
  };
};

export const mapFromConnectionStatus = (connectionStatus: ConnectionStatus): string => {
  switch (connectionStatus) {
    case ConnectionStatus.CONNECTED:
      return 'CONNECTED';
    case ConnectionStatus.CONNECTING:
      return 'CONNECTING';
    case ConnectionStatus.NOT_CONNECTED:
      return 'NOT_CONNECTED';
    default:
      return 'UNKNOWN';
  }
};

export const mapFromPaymentStatus = (paymentStatus: PaymentStatus): string => {
  switch (paymentStatus) {
    case PaymentStatus.NOT_READY:
      return 'NOT_READY';
    case PaymentStatus.READY:
      return 'READY';
    case PaymentStatus.PROCESSING:
      return 'PROCESSING';
    case PaymentStatus.WAITING_FOR_INPUT:
      return 'WAITING_FOR_INPUT';
    default:
      return 'UNKNOWN';
  }
};

export const convertReaderInterface = (reader: Reader): ReaderInterface => {
  let location: LocationInterface | undefined = undefined;
  if ((reader.location as unknown as Record<string, string>).id) {
    location = reader.location as unknown as LocationInterface;
  }
  return {
    baseUrl: '',
    bootloaderVersion: '',
    configVersion: '',
    emvKeyProfileId: '',
    firmwareVersion: '',
    hardwareVersion: '',
    macKeyProfileId: '',
    pinKeyProfileId: '',
    pinKeysetId: '',
    settingsVersion: '',
    trackKeyProfileId: '',
    label: reader.label,
    batteryLevel: 0,
    batteryStatus: BatteryStatus.Unknown,
    simulated: !reader.livemode,
    serialNumber: reader.serial_number,
    isCharging: 0,
    id: 0,
    availableUpdate: undefined,
    locationId: (reader.location as unknown as Record<string, string>).id,
    ipAddress: reader.ip_address || '',
    status: mapFromReaderNetworkStatus(reader.status),
    location: location || undefined,
    locationStatus: LocationStatus.Unknown,
    deviceType: mapFromDeviceType(reader.device_type),
    deviceSoftwareVersion: reader.device_sw_version,
  };
};

export const mapFromDeviceType = (type: ReaderDeviceType): DeviceType => {
  switch (type) {
    case 'bbpos_chipper2x':
      return DeviceType.chipper2X;
    case 'stripe_m2':
      return DeviceType.stripeM2;
    case 'verifone_P400':
      return DeviceType.verifoneP400;
    case 'bbpos_wisepad3':
      return DeviceType.wisePad3;
    case 'bbpos_wisepos_e':
      return DeviceType.wisePosE;
    case 'stripe_s700':
      return DeviceType.stripeS700;
    default:
      return DeviceType.unknown;
  }
};

export const mapFromReaderNetworkStatus = (status: string | null): NetworkStatus => {
  switch (status) {
    case 'offline':
      return NetworkStatus.Offline;
    case 'online':
      return NetworkStatus.Online;
    default:
      return NetworkStatus.Unknown;
  }
};

type ReaderDeviceType =
  | 'bbpos_chipper2x'
  | 'bbpos_wisepad3'
  | 'bbpos_wisepos_e'
  | 'stripe_m2'
  | 'verifone_P400'
  | 'stripe_s700'; // added

export enum PaymentStatus {
  NOT_READY = 'not_ready',
  READY = 'ready',
  WAITING_FOR_INPUT = 'waiting_for_input',
  PROCESSING = 'processing',
}

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  NOT_CONNECTED = 'not_connected',
}

// import {
//   ConnectionStatus,
//   PaymentStatus,
// } from '@stripe/terminal-app-on-devices-js/types/terminal-app-on-devices';
