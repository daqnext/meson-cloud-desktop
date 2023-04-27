const { shell, Menu } = require('electron')
const isDev = require('electron-is-dev')

const setupMenu = (ctx) => {

  const template = [
    { role: 'appMenu' },
    { role: 'fileMenu' },
    { role: 'editMenu' },
    ...isDev ? [{ role: 'viewMenu' }] : [],
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: () => shell.openExternal('https://meson.network')
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

module.exports = setupMenu;
