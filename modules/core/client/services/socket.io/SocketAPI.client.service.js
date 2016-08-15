'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('SocketAPI', ['SocketFactory', 'constants',
  function (SocketFactory, constants) {
    return SocketFactory({
      ioSocketUrl: constants.API_URL
    });
  }
]);
