const { BrowserWindow, shell } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const { DEFAULT_APP_PATH } = require('../common/consts')

const createWindow = () => {

  const mainWindow = new BrowserWindow({
    title: 'meson-client',
    width: 880,
    height: 420,
    resizable: false,
    // show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  let urlPath;
  if (isDev) {
    urlPath = 'http://localhost:3000';
  } else {
    urlPath = `file://${path.join(DEFAULT_APP_PATH, 'build', 'index.html')}`;
  }
  mainWindow.loadURL(urlPath);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
}

const setupWebUI = async (ctx) => {
  if (isDev) {
    await createWindow();
  }
}

module.exports = setupWebUI;
