const logger = require('../common/logger')
const setupProc = require('./process')

const setupNodeCtl = (opt) => {

  let ctx = {}
  ctx.started = false;

  const task = setupProc(opt, { name: 'ctl' });

  ctx.start = async () => {
    if (!ctx.started) {
      const args = [];

      const onExit = () => {
        ctx.started = false;
      }

      task.commonExecAsync(args, null, onExit); // no not wait
    }

    ctx.started = true;
    return this;
  }

  ctx.getNodeToken = async () => {
    let theToken = "";

    const readyHandler = (data) => {
      const output = data.toString();
      theToken = output;
    }

    const args = ['config', 'get_token'];
    await task.commonExecAsync(args, readyHandler, null);

    return theToken;
  }

  ctx.setNodeToken = async (token) => {
    const args = ['config', 'set', `--token=${token}`];
    await task.commonExecAsync(args, null, null);
  }

  ctx.stop = async () => {
    if (!ctx.started) {
      return;
    }
  }

  return ctx;
}

module.exports = setupNodeCtl;