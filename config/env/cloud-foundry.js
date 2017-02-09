'use strict'

var cfenv = require('cfenv')
var appEnv = cfenv.getAppEnv()

var cfMongoUrl = (function () {
  if (appEnv.getService('mean-mongo')) {
    var mongoCreds = appEnv.getService('mean-mongo').credentials
    return mongoCreds.uri || mongoCreds.url
  } else {
    throw new Error('No service names "mean-mongo" bound to the application.')
  }
}())

// var getCred = function (serviceName, credProp) {
//   return appEnv.getService(serviceName)
//       ? appEnv.getService(serviceName).credentials[credProp]
//       : undefined
// }

module.exports = {
  port: appEnv.port,
  db: {
    uri: cfMongoUrl,
    options: {
      user: '',
      pass: ''
    }
  },
  log: {
    // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
    format: 'combined',
    // Stream defaults to process.stdout
    // By default we want logs to go to process.out so the Cloud Foundry Loggregator will collect them
    options: {}
  },
  seedDB: {
    seed: process.env.MONGO_SEED === 'true',
    options: {
      logResults: process.env.MONGO_SEED_LOG_RESULTS !== 'false',
      seedUser: {
        username: process.env.MONGO_SEED_USER_USERNAME || 'user',
        provider: 'local',
        email: process.env.MONGO_SEED_USER_EMAIL || 'user@localhost.com',
        firstName: 'User',
        lastName: 'Local',
        displayName: 'User Local',
        roles: ['user']
      },
      seedAdmin: {
        username: process.env.MONGO_SEED_ADMIN_USERNAME || 'admin',
        provider: 'local',
        email: process.env.MONGO_SEED_ADMIN_EMAIL || 'admin@localhost.com',
        firstName: 'Admin',
        lastName: 'Local',
        displayName: 'Admin Local',
        roles: ['user', 'admin']
      }
    }
  }
}
