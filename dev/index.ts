#!./node_modules/.bin/ts-node

import p from 'commander';
import build from './build';
import clean from './clean';


p.version('0.0.1');

p.command('build [package]')
  .option('--platform', 'Platform for test project builds: android, ios')
  .option('--args', 'Additional args to pass to builder')
  .option('--prod', 'Build in production mode (test project only)')
  .action(async (pkg, cmdObj) => {
    switch (pkg) {
      case 'plugin':
        await build.plugin();
        break;

      case 'test':
        await build.test({ prod: cmdObj });
        break;

      case 'cap':
        await build.cap();
        break;

      default:
        await build.cap();
        await build.plugin();
        await build.test();
    }
  });

p.command('clean [package]')
  .action(async (pkg, cmd) => {
    switch (pkg) {
      case 'plugin':
        await clean.plugin();
        break;

      case 'test':
        await clean.test();
        break;

      case 'cap':
        await clean.cap();
        break;

      default:
        await clean.cap();
        await clean.plugin();
        await clean.test();
    }
  });

p.command('test [package]')
  .option('-t, --target-platform', 'Target test platform: android, ios, browser, none', 'none')
  .action((pkg, cmdObj) => {
    console.log('testing');
  });

p.command('publish [package]')
  .option('--dry-run', 'Dry run', 'false')
  .action((pkg, cmdObj) => {
    console.log('publishing');

  });


p.parse(process.argv);



