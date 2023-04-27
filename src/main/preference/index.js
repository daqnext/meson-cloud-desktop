const { app, ipcMain, BrowserWindow, dialog } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const { DEFAULT_APP_PATH } = require('../common/consts')
const logger = require('../common/logger')
const { showDialog } = require('../dialogs')

let prefWindow

const getPrefFile = () => {
  return path.join('file://', DEFAULT_APP_PATH, 'assets', 'pages', 'tokenpref.html');
}

const tokenPref = (ctx) => {
  if (prefWindow) {
    try {
      prefWindow.show();
      prefWindow.focus();
      return;
    } catch (ex) {
      logger.error(ex)
    }
  }

  prefWindow = new BrowserWindow({
    width: 450, height: 160,
    alwaysOnTop: true,
    modal: true,
    center: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  
  prefWindow.loadURL(getPrefFile());
  prefWindow.show();

  if (isDev) {
    prefWindow.webContents.openDevTools({mode: 'detach'});
  }

  const restart = () => {
    logger.debug('restarting');
    app.relaunch();
    app.exit();
  };

  ipcMain.on('TOKEN_SETTING', async (event, data) => {
    logger.debug('TOKEN_SETTING receive');
    await ctx.setNodeToken(data.token);

    const choosen = showDialog({
      title: 'Desktop Restart',
      message: 'Token changed! Restart to take effect',
      type: 'question',
      buttons: ['Restart', 'Later']
    })

    if (choosen === 0) {
      restart();
    }
  });

  ipcMain.on('TOKEN_LOADING', async (event) => {
    logger.debug('TOKEN_LOADING receive');
    const token = await ctx.getNodeToken();
    prefWindow.webContents.send('TOKEN_GETTING', token); 
  });

  prefWindow.on('close', (event) => {
    event.preventDefault();
    prefWindow.hide();
  })
}

module.exports = tokenPref;