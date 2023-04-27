const { app } = require('electron')
const path = require('path')
const logger = require('../common/logger')
const { IS_WIN, DEFAULT_BIN_PATH, EXE_NAME } = require('../common/consts')
const { newNodeCtl } = require('../ctl')


function getBinPath() {
  const binPath = DEFAULT_BIN_PATH;

  const ExeName = EXE_NAME;

  const exeName = IS_WIN ? ( ExeName + '.exe' ) : ( ExeName );

  return path.join(binPath, exeName)
}

function newNoded() {
  const bin = getBinPath();

  const noded = newNodeCtl({
    bin: bin,
  });

  return noded;
}

async function startWithLogs(ctx, noded) {

  let err, id
  let logs = ''

  try {
    await noded.start();
    id = -1;
  } catch (ex) {
    err = ex;
  } finally {
  }

  return {
    err, id, logs
  };
}

async function startDaemon(ctx, opts) {
  const noded = newNoded();
  if (noded === null) {
    app.quit();
    return { noded: undefined, err: new Error('get node failed'), id: undefined, logs: '' };
  }

  let { err, logs, id } = await startWithLogs(ctx, noded);
  if (err) {
    if (!err.message.includes('ECONNREFUSED') && !err.message.includes('ERR_CONNECTION_REFUSED')) {
      return { noded, err, logs, id };
    }

    // if (!configExists(noded)) {
    //   dialogs.cannotConnectToApiDialog(noded.apiAddr.toString())
    //   return { noded, err, logs, id }
    // }

    const errLogs = await startWithLogs(ctx, noded);
    err = errLogs.err;
    logs = errLogs.logs;
    id = errLogs.id;
  }

  // If we have an error here, it should have been handled by startWithLogs.
  return { noded, err, logs, id };
}

module.exports.startDaemon = startDaemon;