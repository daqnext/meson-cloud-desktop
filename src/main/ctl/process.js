const logger = require('../common/logger')

const translateError = (err) => {
  // get the actual error message to be the err.message
  err.message = `${err.stdout} \n\n ${err.stderr} \n\n ${err.message} \n\n`;
  return err;
}

const setupProcess = (params, options) => {
  const exec = params.bin;
  const cwd = params.cwd;

  const { name } = options;
  const tags = name ? `[${name}]` : "";

  const commonExec = async (args, onReady, onExit) => {

    if (exec == null) {
      throw new Error('No executable specified');
    }

    const { execaSync } = await import("execa");

    try {
      logger.debug(`[CMD] ${exec} ${args.join(" ")}`);

      const { stdout, stderr } = execaSync(exec, args, {
        // env: this.env
        cwd: cwd
      })

      if (stderr)
        logger.error(`${tags} ${stderr.toString()}`);

      if (stdout)
        logger.info(`${tags} ${stdout.toString()}`);

      if (onReady != null) {
        onReady(stdout);
      }

      if (onExit != null) {
        onExit();
      }
    } catch(ex) {
      translateError(ex);
      throw ex;
    }
  }

  // call without await keyword will be run as async
  const commonExecAsync = async (args, onReady, onExit) => {
    if (exec == null) {
      throw new Error('No executable specified');
    }

    const { execa } = await import("execa");

    const funcall = new Promise((resolve, reject) => {
      logger.debug(`[CMD] ${exec} ${args.join(" ")}`);

      const subprocess = execa(exec, args, {
        // env: this.env
        cwd: cwd
      })

      const { stdout, stderr } = subprocess;

      if (stderr == null) {
        throw new Error('stderr was not defined on subprocess');
      }

      if (stdout == null) {
        throw new Error('stdout was not defined on subprocess');
      }

      stderr.on('data', data => {
        logger.error(`${tags} ${data.toString()}`);
      })
      stdout.on('data', data => {
        logger.info(`${tags} ${data.toString()}`);
      })

      if (onReady != null) {
        stdout.on('data', onReady);
      }

      subprocess.catch(err => reject(translateError(err)));
      subprocess.on('close', () => {
        stderr.removeAllListeners();
        stdout.removeAllListeners();

        if (onExit != null) {
          onExit();
        }
        resolve("");
      })
    })

    await funcall;
  }

  return {
    commonExec,
    commonExecAsync,
  }
}

module.exports = setupProcess;