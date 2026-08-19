---
title: 'Reader Lifecycle'
code: ['reader-lifecycle/reader-lifecycle.ts.md']
scrollActiveLine:
  [
    { id: '', activeLine: { ['reader-lifecycle.ts']: [1, 1] } },
    { id: 'listen-for-software-updates', activeLine: { ['reader-lifecycle.ts']: [2, 35] } },
    { id: 'listen-for-status-and-input', activeLine: { ['reader-lifecycle.ts']: [35, 63] } },
    { id: 'set-reader-display', activeLine: { ['reader-lifecycle.ts']: [63, 78] } },
    { id: 'cancel-discovery', activeLine: { ['reader-lifecycle.ts']: [78, 80] } },
    { id: 'disconnect-and-reconnection', activeLine: { ['reader-lifecycle.ts']: [80, 112] } },
    { id: 'error-handling', activeLine: { ['reader-lifecycle.ts']: [112, 119] } },
  ]
---

Keep reader software updates, status, and display messaging under control so Terminal operations do not interrupt checkout.

## Listen for software updates

The reader may start updating itself when needed. Listen for available updates, install or cancel them, and surface progress while an install is running.

Constraints:

- Call `setSimulatorConfiguration` **before** `discoverReaders` when you need a simulated update (`SimulateReaderUpdate.UpdateAvailable` or `Required`). Web `setSimulatorConfiguration` is a no-op.
- `StartInstallingUpdate`, `ReaderSoftwareUpdateProgress`, and `FinishInstallingUpdate` apply to Bluetooth and USB readers. A **mandatory** update on first connect installs automatically, **before** `ConnectedReader` and before `connectReader()` resolves. Sequence: `StartInstallingUpdate` → `ReaderSoftwareUpdateProgress` (repeated) → `FinishInstallingUpdate` → `ConnectedReader` → `connectReader()` resolves. Show UI so a long connect is not mistaken for a hang.
- `ReportAvailableUpdate` means an optional update is ready; call `installAvailableUpdate` when the merchant can wait. Do not start an optional install during checkout.
- `progress` is a float between `0` and `1`.
- `cancelInstallUpdate` cancels an in-flight install when the SDK allows it. Web install/cancel methods are no-ops.
- iOS Tap to Pay also reports install start/progress/finish through the Tap to Pay reader delegate. Android Tap to Pay UX is separate; see [Tap to Pay](./tap-to-pay.md).

!::installAvailableUpdate::

!::cancelInstallUpdate::

!::setSimulatorConfiguration::

## Listen for status and input

For readers without a leader screen, retrieve battery level, reader events, display messages, and input prompts with listeners and show them on the mobile device.

`BatteryLevel`, `ReaderEvent`, `RequestDisplayMessage`, and `RequestReaderInput` apply to Bluetooth and USB readers. Battery updates are emitted on connection and about every 10 minutes.

## Set reader display

On devices with a leader screen, show cart contents before `collectPaymentMethod`. Clear the display when you are done. Internet readers on web support these calls.

!::setReaderDisplay::

!::clearReaderDisplay::

!::Cart::

!::CartLineItem::

## Cancel discovery

Call `cancelDiscoverReaders` when the user leaves the scan screen or after a timeout. On success, native platforms emit `CancelDiscoveredReaders`. If nothing is in progress, the promise still resolves.

iOS Bluetooth discovery can run for a long time and will keep emitting `DiscoveredReaders`. Pair cancel with `bluetoothScanWaitTime` or your own timeout. Web `cancelDiscoverReaders` is a no-op.

!::cancelDiscoverReaders::

## Disconnect and reconnection

`disconnectReader` disconnects the current reader. If none is connected, the promise resolves.

`DisconnectedReader` behavior:

- Every reader type emits it in response to `disconnectReader()` **without** a `reason`.
- Bluetooth and USB also emit it **with** a `reason` when the reader finishes disconnecting. A user-initiated disconnect therefore yields **two** events: acknowledgement, then the reasoned disconnect.

Do **not** treat `ConnectionStatusChange` as an unexpected disconnect. Use `UnexpectedReaderDisconnect` to notify the user. You may call `discoverReaders` again to reconnect; always provide a timeout or `cancelDiscoverReaders`.

Set `autoReconnectOnUnexpectedDisconnect: true` on `connectReader` for Tap to Pay and Bluetooth when you want the SDK to retry. Then listen for:

- `ReaderReconnectStarted` — includes `reader` and `reason`
- `ReaderReconnectSucceeded`
- `ReaderReconnectFailed`

`cancelReaderReconnection` cancels an in-flight reconnect. Web `rebootReader` and `cancelReaderReconnection` are no-ops.

!::getConnectedReader::

!::rebootReader::

!::cancelReaderReconnection::

## Error handling

`Failed` fires when collect or confirm fails; the corresponding promise rejects with the same `message` / `code` / `declineCode` when the native SDK provides them.

`UnexpectedReaderDisconnect` means the Terminal dropped the reader outside of `disconnectReader()`. For Bluetooth and USB, inspect `DisconnectedReader` for `DisconnectReason` (`POWERED_OFF`, `BLUETOOTH_DISABLED`, `CRITICALLY_LOW_BATTERY`, and others).
