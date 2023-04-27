const { app, dialog } = require('electron')
const store = require('./common/store')

const setupAppMenu = require('./app-menu')
const setupWebUI = require('./webui')
const setupDaemon = require('./daemon')
const setupTray = require('./tray')
const setupAutoUpdater = require('./auto-updater')
const setupAutoStartup = require('./auto-startup')

if (app.dock) app.dock.hide(); // for macOS

// Only one instance can run at a time
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const ctx = {}

async function initApp(ctx) {
  await setupAppMenu(ctx);
  await setupWebUI(ctx);
  await setupTray(ctx);
  await setupDaemon(ctx);
  await setupAutoUpdater(ctx);
  await setupAutoStartup(ctx);
}

async function run() {
  app.on('second-instance', () => {
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  try {
    await app.whenReady();
  } catch (ex) {
    dialog.showErrorBox('Electron could not start', ex.stack);
    app.exit(1);
  }

  ctx.store = store

  await initApp(ctx);

  app.on('activate', function () {
  });
}

run();

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


