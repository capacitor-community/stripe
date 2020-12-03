import path from 'path';


export const ROOT_DIR = path.join(__dirname, '../');
export const ROOT_DIR_NAME = path.basename(ROOT_DIR);

export const PACKAGES_DIR = path.resolve(ROOT_DIR, 'packages');
export const CAP_DIR = path.resolve(PACKAGES_DIR, 'android');
export const PLUGIN_DIR = path.resolve(PACKAGES_DIR, 'plugin');
export const TEST_DIR = path.resolve(PACKAGES_DIR, 'test');
