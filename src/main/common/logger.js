const { createLogger, format, transports } = require('winston')
const { join } = require('path')
const { app } = require('electron')
const fs = require('fs')
const { DEFAULT_USER_PATH } = require('./consts')

const { combine, splat, timestamp, printf } = format
// const logsDir = app.getPath('userData')
const logsDir = join(DEFAULT_USER_PATH, 'logs')
const logsFilePath = join(logsDir, 'combined.log')

fs.existsSync(logsDir) || fs.mkdirSync(logsDir)

const errorFile = new transports.File({
  level: 'error',
  filename: join(logsDir, 'error.log')
})

errorFile.on('finish', () => {
  process.exit(1)
})

const logger = createLogger({
  format: combine(
    timestamp(),
    splat(),
    printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: 'debug',
      silent: process.env.NODE_ENV === 'production'
    }),
    errorFile,
    new transports.File({
      level: 'debug',
      filename: logsFilePath
    })
  ]
})

logger.info(`[meta] logs can be found on ${logsDir}`)

module.exports = Object.freeze({
  start: (msg, opts = {}) => {
    const start = performance.now()
    logger.info(`${msg} STARTED`)

    return {
      end: () => {
        const seconds = (performance.now() - start) / 1000

        logger.info(`${msg} FINISHED ${seconds}s`)
      },
      info: (str) => {
        logger.info(`${msg} ${str}`)
      },
      fail: (err) => {
        logger.error(`${msg} ${err.stack}`)
      }
    }
  },
  info: (msg, opts = {}) => {
    logger.info(msg)
  },

  debug: (msg, opts = {}) => {
    logger.debug(msg)
  },

  error: (err) => {
    logger.error(err)
  },

  logsDir,
  logsFilePath,
})

