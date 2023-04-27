const logger = require('../common/logger');
const { startDaemon } = require('./daemon');

const setupDaemon = async (ctx) => {
  let noded = null;

  const store = ctx.store;

  const getNoded = async (optional = false) => {
    if (optional) {
      return noded
    }

    return noded
  }

  const startNoded = async () => {
    if (noded) {
      return;
    }

    const log = logger.start('[daemon init]');
    const opts = store.get('opts');

    const res = await startDaemon(ctx, opts);
    if (res.err) {
      log.fail(res.err);
      return;
    }

    noded = res.noded;

    log.end();
  }

  const stopNoded = async () => {
    if (!noded) {
      return
    }

    const log = logger.start('[daemon stop]');

    try {
      await noded.stop();
    } catch (err) {
      log.fail(`${err.toString()}`);
    } finally {
      noded = null
    }

    log.end();
  }

  const setNodeToken = async (token) => {
    if (!noded) {
      return ""
    }

    try {
      return await noded.setNodeToken(token);
    } catch (err) {
      logger.error(`[daemon] ${err.toString()}`)
    }
  }

  const getNodeToken = async () => {
    logger.info(`[getNodeToken] ` + noded)

    if (!noded) {
      return ""
    }

    try {
      return await noded.getNodeToken();
    } catch (err) {
      logger.error(`[daemon] ${err.toString()}`)
    }

    return "SOMETHING ERROR"
  }

  ctx.getNoded = getNoded;
  ctx.startNoded = startNoded;
  ctx.stopNoded = stopNoded;
  ctx.setNodeToken = setNodeToken;
  ctx.getNodeToken = getNodeToken;

  await startNoded();
}

module.exports = setupDaemon;
