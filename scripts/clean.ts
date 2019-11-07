import chalk from 'chalk';
import { exec } from 'child-process-promise';
import ora from 'ora';
import path from 'path';
import rimraf from 'rimraf';
import { CAP_DIR, PLUGIN_DIR } from './util';


async function cap() {
  const o = ora('Cleaning @capacitor/android').start();
  const { stderr } = await exec('./gradlew clean -b capacitor/build.gradle', {
    cwd: CAP_DIR,
  });

  if (stderr) {
    console.error(chalk.bold.red(stderr));
    process.exit(1);
  }

  o.succeed();
}

async function plugin() {
  const o = ora('Cleaning Capacitor plugin').start();
  rimraf.sync(path.resolve(PLUGIN_DIR, 'dist'));

  {
    const { stderr } = await exec('./gradlew clean', {
      cwd: path.resolve(PLUGIN_DIR, 'android'),
    });

    if (stderr) {
      console.error(chalk.bold.red(stderr));
      process.exit(1);
    }
  }

  o.succeed();
}

async function test() {
  const o = ora('Cleaning test app').start();

  rimraf.sync(path.resolve(PLUGIN_DIR, 'www'));

  {
    const { stderr } = await exec('./gradlew clean', {
      cwd: path.resolve(PLUGIN_DIR, 'android'),
    });

    if (stderr) {
      console.error(chalk.bold.red(stderr));
      process.exit(1);
    }
  }

  o.succeed();
}

export default {
  cap,
  plugin,
  test,
};
