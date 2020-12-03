import chalk from 'chalk';
import { exec } from 'child-process-promise';
import ora from 'ora';
import path from 'path';
import { CAP_DIR, PLUGIN_DIR, TEST_DIR } from './util';


async function cap() {
  const o = ora('Building @capacitor/android').start();

  const { stderr } = await exec('./gradlew clean build -b capacitor/build.gradle -Pandroid.useAndroidX=true -Pandroid.enableJetifier=true 2>&1', {
    cwd: CAP_DIR,
  });

  if (stderr) {
    console.error(chalk.bold.red(stderr));
    process.exit(1);
  }
  o.succeed();
}

async function plugin() {
  const o = ora('Building Capacitor plugin').start();

  {
    const { stderr } = await exec('npm run build', {
      cwd: PLUGIN_DIR,
    });

    if (stderr) {
      console.error(stderr);
      process.exit(1);
    }
  }

  {
    const { stderr } = await exec('./gradlew build 2>&1', {
      cwd: path.resolve(PLUGIN_DIR, 'android'),
    });

    if (stderr) {
      console.error(chalk.bold.red(stderr));
      process.exit(1);
    }
  }

  o.succeed();
}

async function test(opts?: { prod?: boolean }) {
  const o = ora('Building test app').start();
  opts = opts || {};

  let cmd = `npm run build --`;

  if (opts.prod) {
    o.start(chalk`Building test app {bold.yellow (Production mode)}`);
    cmd += ` --prod`;
  }

  const { stderr } = await exec(cmd, {
    'cwd': TEST_DIR,
  });

  if (stderr) {
    console.error(chalk.bold.red(stderr));
    process.exit(1);
  }

  o.succeed();
}

export default {
  cap,
  plugin,
  test,
};
