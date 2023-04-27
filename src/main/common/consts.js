const { app } = require('electron')
const os = require('os')
const isDev = require('electron-is-dev')
const packageJson = require('../../../package.json')
const path = require('path')

const getUserPath = () => {
  const userPath = app.getPath('home');
  return userPath;
}

const getAppPath = () => {
  const appPath = app.getAppPath();
  return appPath;
}

const getExtraResPath = () => {
  if (isDev) {
    return app.getAppPath();
  } else {
    return path.join(process.resourcesPath, 'static');
  }
}

const getExtraBinPath = () => {
  return path.join(getExtraResPath(), 'bin');
}

module.exports = Object.freeze({
  IS_MAC: os.platform() === 'darwin',
  IS_WIN: os.platform() === 'win32',
  IS_LINUX: os.platform() === 'linux',
  IS_APPIMAGE: typeof process.env.APPIMAGE !== 'undefined',
  VERSION: packageJson.version,
  ELECTRON_VERSION: process.versions.electron,
  DEFAULT_APP_PATH: getAppPath(),
  DEFAULT_RES_PATH: getExtraResPath(),
  DEFAULT_BIN_PATH: getExtraBinPath(),
  EXE_NAME: 'meson-cloud-client',
})
