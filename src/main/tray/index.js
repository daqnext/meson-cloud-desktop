const { Menu, Tray, shell, app, ipcMain } = require('electron')
const { IS_MAC, VERSION } = require('../common/consts')
const logger = require('../common/logger')
const store = require('../common/store')
const icon = require('./icon')

const tokenPref = require('../preference')
const { isSupportStartup } = require('../auto-startup')

const showLogsFolder = (onlyDir) => {
  if (onlyDir) {
    shell.openPath(logger.logsDir);
  } else {
    shell.showItemInFolder(logger.logsFilePath);
  }
}

const showDashboard = () => {
  shell.openExternal('https://dashboard.meson.network/labs/gatewayx');
}

function buildMenu(ctx) {

  return Menu.buildFromTemplate([
    {
      label: 'Dashboard',
      click: () => { showDashboard() }
    },
    {
      label: 'About',
      submenu: [
        {
          label: 'Versions',
          enabled: false
        },
        {
          label: `Desktop ${VERSION}`,
        },
        { type: 'separator' },
        {
          id: 'checkForUpdates',
          label: 'Check Updates',
          click: () => { ctx.manualCheckForUpdates() }
        },
      ]
    },
    { type: 'separator' },
    {
      label: 'Settings',
      submenu: [
        {
          id: 'TOGG_AUTO_STARTUP',
          label: 'Start at Login',
          click: () => { ipcMain.emit('TOGG_AUTO_STARTUP') },
          type: 'checkbox',
          checked: false
        },
        {
          label: 'Token Setting',
          click: () => { tokenPref(ctx); }
        }
      ]
    },
    {
      label: 'Advanced',
      submenu: [
        {
          label: 'openLogsDir',
          click: () => { showLogsFolder(false); }
        },
        // {
        //   label: 'openRepoDir',
        //   click: () => { shell.openPath(store.get('ipfsConfig.path')) }
        // },
        // {
        //   label: 'openConfigFile',
        //   click: () => { shell.openPath(store.path) }
        // }
      ]
    },
    {
      label: 'Quit',
      click: () => { app.quit() },
      accelerator: IS_MAC ? 'Command+Q' : null
    }
  ]);
}

const on = 'on'
const off = 'off'


// Ok this one is pretty ridiculous:
// Tray must be global or it will break due to GC:
// https://www.electronjs.org/docs/faq#my-apps-tray-disappeared-after-a-few-minutes
let tray = null;

function setupTray(ctx) {
  logger.info('[tray] starting');

  tray = new Tray(icon(on));
  let menu = null;

  const popupMenu = (event) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    tray.popUpContextMenu();
  }

  if (!IS_MAC) {
    // Show the context menu on left click on other
    // platforms than macOS.
    tray.on('click', popupMenu);
  }

  tray.on('right-click', popupMenu);
  tray.on('double-click', () => {
  });

  const setupMenu = () => {
    menu = buildMenu(ctx);

    tray.setContextMenu(menu);
    tray.setToolTip('Meson Cloud Desktop');

    menu.on('menu-will-show', () => {
      // ipcMain.emit(ipcMainEvents.MENUBAR_OPEN) 
    })
    menu.on('menu-will-close', () => {
      // ipcMain.emit(ipcMainEvents.MENUBAR_CLOSE)
    })

    updateMenu()
  }

  const updateMenu = () => {
    menu.getMenuItemById('TOGG_AUTO_STARTUP').enabled = isSupportStartup();

    // Update configuration checkboxes.
    const CONFIG_KEYS = [ 'TOGG_AUTO_STARTUP' ]
    
    for (const key of (CONFIG_KEYS)) {
      const enabled = store.get(key, false)
      const item = menu.getMenuItemById(key)
      if (item) {
        // Not all items are present in all platforms.
        item.checked = enabled
      }
    }
  };

  ipcMain.on('CONFIG_UPDATED', () => { updateMenu() });

  setupMenu();

  app.on('before-quit', function (event) {
    logger.info('[tray event] before-quit')
    tray.destroy();
  });

  ctx.tray = tray;
  logger.info('[tray] started');
}

module.exports = setupTray;