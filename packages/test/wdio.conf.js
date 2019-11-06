const TEST_PLATFORM = process.env.TEST_PLATFORM;
const testAndroid = TEST_PLATFORM === 'android' || TEST_PLATFORM === 'all';
const testIos = TEST_PLATFORM === 'ios' || TEST_PLATFORM === 'all';
const CI = process.env.CI === 'true';
const RD_KEY = process.env.SAUCE_RD_API_KEY;

const config = {
  runner: 'local',
  specs: [
    './tests/*.spec.js',
  ],
  suites: {
    Stripe: ['./test/*.spec.js'],
  },
  maxInstances: 1,
  capabilities: [],
  logLevel: 'debug',
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

if (testAndroid) {
  const c = {
    platformName: 'Android',
    platformVersion: process.env.ANDROID_PLATFORM_VERSION || '9.0',
    app: process.env.ANDROID_APK_PATH || './android/app/build/outputs/apk/debug/app-debug.apk',
    autoWebview: true,
    autoGrantPermissions: true,
    phoneOnly: false,
    tabletOnly: false,
    privateDeviceOnly: false,
    isHeadless: true,
  };

  if (CI) {
    c.testobject_api_key = process.env.SAUCE_ANDROID_API_KEY;
  }

  const devName = process.env.ANDROID_DEVICE_NAME;

  if (devName) {
    c.deviceName = devName;
  }

  config.capabilities.push(c);
}

if (testIos) {
  const c = {
    platformName: 'iOS',
    platformVersion: process.env.IOS_PLATFORM_VERSION || '11.0',
    deviceName: process.env.IOS_DEVICE_NAME || 'any',
    app: process.env.IOS_IPA_PATH || './app.ipa',
    autoWebview: true,
    autoGrantPermissions: true,
//    phoneOnly: false,
//    tabletOnly: false,
//    privateDeviceOnly: false,
//    isHeadless: true,
  };

  if (CI) {
    c.testobject_api_key = process.env.SAUCE_IOS_API_KEY;
  }

  config.capabilities.push(c);
}

if (!CI) {
  config.port = 4723;
}

exports.config = config;
