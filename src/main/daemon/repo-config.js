const path = require('path')
const fs = require("fs")
const logger = require('../common/logger')
const { IS_WIN, EXE_NAME, DEFAULT_USER_PATH, DEFAULT_BIN_PATH } = require('../common/consts')

const mkdirPathSync = (to) => {
  const dir = path.dirname(to);
  if (to === dir)
    return false;
  
  if (fs.existsSync(to)) 
    return true;

  if (mkdirPathSync(dir)) {
    fs.mkdirSync(to)
    return true;
  }
  return false;
}

const getBinPath = () => {
  const binPath = DEFAULT_BIN_PATH;

  const ExeName = EXE_NAME;

  const exeName = IS_WIN ? ( ExeName + '.exe' ) : ( ExeName );

  return path.join(binPath, exeName)
}

const setupRepoConfig = () => {

  let repo = {
    exePath: "",
    repoPath: ""
  }

  const init = () => {

    repo.exePath = getBinPath();

    let repoPath = path.join(DEFAULT_USER_PATH, "/.config/mesoncloud");
    repo.repoPath = path.normalize(repoPath);

    return repo;
  }

  const initConfigFolder = () => {
    mkdirPathSync(repo.repoPath);
    const toCfgFile = path.join(repo.repoPath, "config.yml");
    const cfgTemplate = path.join(DEFAULT_BIN_PATH, "config.yml.template");

    if (!fs.existsSync(toCfgFile)) {
      if (fs.existsSync(cfgTemplate)) {
        try {
          fs.unlinkSync(toCfgFile);
        } catch (ex) {}

        fs.copyFileSync(cfgTemplate, toCfgFile);
      }
    }

    const logsDir = path.join(repo.repoPath, "logs");
    fs.existsSync(logsDir) || fs.mkdirSync(logsDir);
  }

  const autoFixConfig = () => {
    try {
      fs.unlinkSync(path.join(repo.repoPath, "config.yaml"))
    } catch (t) {}
    // e.reloadElectron();
  }

  init();

  repo.initConfigFolder = initConfigFolder;
  repo.autoFixConfig = autoFixConfig;

  return repo;
}

module.exports = setupRepoConfig;
