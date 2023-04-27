const { nativeImage, nativeTheme } = require('electron')
const path = require('path')
const { IS_MAC, DEFAULT_APP_PATH } = require('../common/consts')

const getTrayIconPath = () => {
  return path.join(DEFAULT_APP_PATH, 'assets', 'icons', 'tray');
}

const icon = (status) => {
  const dir = path.resolve(getTrayIconPath());

  if (IS_MAC) {
    const iconImage = path.join(dir, 'macos', `${status}-Template.png`);

    const img = nativeImage.createFromPath(iconImage);
    img.setTemplateImage(true);
    return img;
  }

  const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  return path.join(dir, 'others', `${status}-32-${theme}.png`)
}

module.exports = icon;