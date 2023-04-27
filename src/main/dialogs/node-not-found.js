const dialog = require('./dialog')
const logger = require('../common/logger')

module.exports = async function () {
  logger.info('[node-not-found] an action needs node to be running')

  const option = dialog({
    title: 'Not Found',
    message: 'Can not found node app\n please re-install properly',
    buttons: [
      'OK',
    ]
  })

  if (option !== 0) {
    return false
  }

  return false
}
