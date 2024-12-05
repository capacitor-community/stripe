import { updatePackage } from 'write-pkg';
import path from 'path';
import pkg from './package.json' with { type: 'json' };
import { exec } from 'child_process';

const workspaces = ['packages/payment', 'packages/identity', 'packages/terminal'];

workspaces.forEach(async (workspace) => {
  const releasePackagePath = path.resolve('./' + workspace);
  await updatePackage(releasePackagePath + '/package.json', { version: pkg.version });

  const isStable = (version) => {
    const stableRegex = /^[0-9]+\.[0-9]+\.[0-9]+$/;
    return stableRegex.test(version);
  }

  exec(`cd ${releasePackagePath} && npm install && npm run build && npm publish` + (isStable(pkg.version) ? '' : ' --tag next'), (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
});
