const pino = require('pino')

const logger = pino({
  serializers: {
    err: (err) => ({ error: err }),
  },
})

module.exports = logger
