'use strict'

// var defaultEnvConfig = require('./default')

module.exports = {
    // db: {
    //   uri: 'mongodb://' +
    // 'dashboard:oncuedbpassword1@candidate.60.mongolayer.com:10826,candidate.40.mongolayer.com:11103/dashboard?replicaSet=set-570bf65e3f3b3bf9b0000a0f',
    // options: { user: '', pass: '' }, debug: process.env.MONGODB_DEBUG || false },
  log: {
    // logging with Morgan - https://github.com/expressjs/morgan
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'dev',
    options: {
    }
  },
  app: {
    title: 'Sellr Dashboard'
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  },
  livereload: true
}
