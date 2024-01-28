import { updatePackage } from 'write-pkg';
import path from 'path';
import pkg from './package.json' assert { type: 'json' };
import { exec } from 'child_process';

const workspaces = ['packages/payment', 'packages/identity', 'packages/terminal'];

workspaces.forEach(async (workspace) => {
  const releasePackagePath = path.resolve('./' + workspace);
  await updatePackage(releasePackagePath + '/package.json', { version: pkg.version });
  exec(`cd ${releasePackagePath} && npm install && npm run build && npm publish --tag next`, (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(stdout);
  });
});
