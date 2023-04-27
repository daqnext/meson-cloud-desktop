const { app, ipcMain } = require('electron')
const os = require('os')
const logger = require('../common/logger')
const store = require('../common/store')
const { IS_MAC, IS_WIN } = require('../common/consts')

const create_toggle = (key, job) => {
  ipcMain.on(key, async () => {
    const oldValue = store.get(key, null);
    const newValue = !oldValue;

    if (await job({ newValue, oldValue })) {
      store.set(key, newValue);

      const action = newValue ? 'enabled' : 'disabled';
      logger.info(`[${key}] ${action}`);
    }

    // We always emit the event so any handlers for it can act upon
    // the current configuration, whether it was successfully
    // updated or not.
    ipcMain.emit('CONFIG_UPDATED');
  })
}

function isSupported () {
  const plat = os.platform();
  return plat === 'linux' || plat === 'win32' || plat === 'darwin';
}

async function enable () {
  if (app.setLoginItemSettings && (IS_MAC || IS_WIN)) {
    app.setLoginItemSettings({ openAtLogin: true });
    return
  }
}

async function disable () {
  if (app.setLoginItemSettings && (IS_MAC || IS_WIN)) {
    app.setLoginItemSettings({ openAtLogin: false })
    return
  }
}

const setupStartup = async (ctx) => {

  const job = async (params) => {

    const { newValue, oldValue } = params;
    if (!isSupported()) {
      logger.info('[auto startup] not supported on this platform');
      return false;
    }

    if (newValue === oldValue) return;

    try {
      if (newValue) {
        await enable()
        logger.info('[auto startup] enabled');
      } else {
        await disable()
        logger.info('[auto startup] disabled');
      }

      return true;
    } catch (err) {
      logger.error(`[auto startup] ${err.toString()}`);
    }
  }

  const params = { newValue: store.get('TOGG_AUTO_STARTUP', false) };
  job(params);
  create_toggle('TOGG_AUTO_STARTUP', job);

  return false;
};

module.exports = setupStartup;
module.exports.isSupportStartup = isSupported;
