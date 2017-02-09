'use strict'

// Create the Socket.io wrapper service
angular.module('core').service('SocketBWS', ['SocketFactory', 'constants',
  function (SocketFactory, constants) {
    return SocketFactory({
      ioSocketUrl: constants.BWS_API
    })
  }
])
