const pino = require('pino')

const logger = (defaultConfig) =>
  pino({
    ...defaultConfig,
    errorKey: 'error',
    messageKey: 'message',
  })

module.exports = { logger }
