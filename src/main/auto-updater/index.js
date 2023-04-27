const { shell, app, BrowserWindow, Notification } = require('electron')
const { autoUpdater } = require('electron-updater')
const logger = require('../common/logger')
const { IS_MAC, IS_WIN, IS_APPIMAGE } = require('../common/consts')
const showDialog = require('../dialogs')

function isAutoUpdateSupported () {
  // atm only macOS, windows and AppImage builds support autoupdate mechanism,
  // everything else needs to be updated manually or via a third-party package manager
  return IS_MAC || IS_WIN || IS_APPIMAGE;
}

let updateNotification = null // must be a global to avoid gc

function setup (ctx) {
  // we download manually in 'update-available'
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', (err) => {
    logger.info(`[updater] ${err.toString()}`);
  });

  autoUpdater.on('checking-for-update', () => {
    logger.info(`[updater] checking-for-update`);
  });

  autoUpdater.on('update-available', async ({ version, releaseNotes }) => {
    logger.info(`[updater] update to ${version} available, download will start`);

    try {
      await autoUpdater.downloadUpdate();
    } catch (ex) {
      logger.error(`[updater] ${ex.toString()}`);
    }
  });

  autoUpdater.on('update-not-available', ({ version }) => {
    logger.info('[updater] update not available');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    logger.info('[updater] download-progress ' + log_message);
  });

  autoUpdater.on('update-downloaded', ({ version }) => {
    logger.info(`[updater] update to ${version} downloaded`);

    const feedbackDialog = () => {
      const choosen = showDialog({
        title: 'Desktop Update',
        message: `An update to Desktop ${ version } is available. Would you like to install it now?`,
        type: 'info',
        buttons: ['Later', 'Now']
      })

      if (choosen === 1) { // now
        setImmediate(async () => {
          await beforeQuitCleanup(); // just to be sure (we had regressions before)
          autoUpdater.quitAndInstall();
        })
      }
    }
    // show unobtrusive notification + dialog on click
    updateNotification = new Notification({
      title: 'Desktop Update',
      body: `An update to Desktop ${ version } is available.`,
    });
    updateNotification.on('click', feedbackDialog);
    updateNotification.show();
  });

  // In some cases before-quit event is not emitted before all windows are closed,
  // and we need to do cleanup here
  const beforeQuitCleanup = async () => {
    BrowserWindow.getAllWindows().forEach(w => w.removeAllListeners('close'))
    app.removeAllListeners('window-all-closed')
    try {
      await ctx.stopNoded()
      logger.info(`[beforeQuitCleanup] had finished`)
    } catch (ex) {
      logger.error(`[beforeQuitCleanup] had an error ] ${ex.toString()}`);
    }
  };
}

const checkForUpdates = async () => {
  // ipcMain.emit(ipcMainEvents.UPDATING)
  try {
    const res = await autoUpdater.checkForUpdates();
    console.log("update Info " + res?.updateInfo);
  } catch (_) {
    // Ignore. The errors are already handled on 'error' event.
  }
  // ipcMain.emit(ipcMainEvents.UPDATING_ENDED)
}

const setupAutoUpdater = async function (ctx) {

  if (!isAutoUpdateSupported()) {
    ctx.manualCheckForUpdates = () => {
      shell.openExternal('https://meson.network/release');
    };
    return;
  }

  setup(ctx);

  checkForUpdates(); // background check

  setInterval(checkForUpdates, 43200000); // every 12 hours

  // enable on-demand check via About submenu
  ctx.manualCheckForUpdates = () => {
    checkForUpdates();
  }
}

module.exports = setupAutoUpdater;