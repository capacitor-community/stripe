import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

const run = (...args) =>
  execFileSync("xcrun", args, { encoding: "utf8" }).trim();
const majorMinor = (version) => version.split(".").slice(0, 2).join(".");
const sdk = majorMinor(run("--sdk", "iphonesimulator", "--show-sdk-version"));
const findRuntime = () =>
  JSON.parse(run("simctl", "list", "runtimes", "--json")).runtimes.find(
    (runtime) =>
      runtime.isAvailable &&
      runtime.name.startsWith("iOS ") &&
      majorMinor(runtime.version) === sdk,
  );

let runtime = findRuntime();
if (!runtime) {
  execFileSync(
    "xcodebuild",
    ["-downloadPlatform", "iOS", "-buildVersion", sdk],
    { stdio: "inherit" },
  );
  runtime = findRuntime();
}
if (!runtime)
  throw new Error(
    `No available iOS ${sdk} Simulator runtime for the selected Xcode.`,
  );

const [major, minor, patch = 0] = runtime.version.split(".").map(Number);
const runtimeVersion = major * 65536 + minor * 256 + patch;
const deviceTypes =
  runtime.supportedDeviceTypes ??
  JSON.parse(run("simctl", "list", "devicetypes", "--json")).devicetypes.filter(
    (type) =>
      type.minRuntimeVersion <= runtimeVersion &&
      type.maxRuntimeVersion >= runtimeVersion,
  );
const phoneTypes = deviceTypes.filter(
  (type) => type.productFamily === "iPhone",
);
if (!phoneTypes.length)
  throw new Error(
    `No supported iPhone device type for iOS ${runtime.version}.`,
  );
const devices =
  JSON.parse(run("simctl", "list", "devices", "available", "--json")).devices[
    runtime.identifier
  ] ?? [];
const device = devices.find((candidate) =>
  phoneTypes.some((type) => type.identifier === candidate.deviceTypeIdentifier),
);
const id =
  device?.udid ??
  run(
    "simctl",
    "create",
    "Stripe CI iPhone",
    phoneTypes[0].identifier,
    runtime.identifier,
  );
const destination = `platform=iOS Simulator,id=${id}`;
if (process.env.GITHUB_ENV)
  appendFileSync(
    process.env.GITHUB_ENV,
    `IOS_TEST_DESTINATION=${destination}\n`,
  );
console.log(`Using iOS ${runtime.version} Simulator: ${destination}`);
