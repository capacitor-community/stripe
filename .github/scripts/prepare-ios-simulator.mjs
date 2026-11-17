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

const deviceType = "com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro";
const devices =
  JSON.parse(run("simctl", "list", "devices", "available", "--json")).devices[
    runtime.identifier
  ] ?? [];
const device = devices.find(
  (candidate) => candidate.deviceTypeIdentifier === deviceType,
);
const id =
  device?.udid ??
  run("simctl", "create", "Stripe CI iPhone", deviceType, runtime.identifier);
const destination = `platform=iOS Simulator,id=${id}`;
if (process.env.GITHUB_ENV)
  appendFileSync(
    process.env.GITHUB_ENV,
    `IOS_TEST_DESTINATION=${destination}\n`,
  );
console.log(`Using iOS ${runtime.version} Simulator: ${destination}`);
