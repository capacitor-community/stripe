const config = {
  singleton: true,
  runner: 'local',
  port: 4723,
  specs: [
    './tests/*.spec.js',
  ],
  suites: {
    Stripe: ['./test/*.spec.js'],
  },
  maxInstances: 1,
  capabilities: [],
  logLevel: 'error',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['appium'],
  appium: {
    command: 'appium',
  },
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 5000,
  },
};

const TEST_PLATFORM = process.env.TEST_PLATFORM;

const testAndroid = TEST_PLATFORM === 'android' || TEST_PLATFORM === 'all';
const testIos = TEST_PLATFORM === 'ios' || TEST_PLATFORM === 'all';

if (testAndroid) {
  config.capabilities.push({
    platformName: 'Android',
    platformVersion: process.env.ANDROID_PLATFORM_VERSION || '9.0',
    deviceName: process.env.ANDROID_DEVICE_NAME || 'any',
    app: process.env.ANDROID_APK_PATH || './android/app/build/outputs/apk/debug/app-debug.apk',
    autoWebview: true,
    autoGrantPermissions: true,
  });
}

if (testIos) {
  config.capabilities.push({
    platformName: 'iOS',
    platformVersion: process.env.IOS_PLATFORM_VERSION || '11.0',
    deviceName: process.env.IOS_DEVICE_NAME || 'any',
    app: process.env.IOS_IPA_PATH || './app.ipa',
    autoWebview: true,
    autoGrantPermissions: true,
  });
}


exports.config = config;
