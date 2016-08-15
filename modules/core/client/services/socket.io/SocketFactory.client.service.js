'use strict';

angular.module('core').service('SocketFactory', ['socketFactory',
  function (socketFactory) {
    return function (options) {
      options = options || {};
      if (options.ioSocketUrl) options.ioSocket = io.connect(options.ioSocketUrl);

      var socket = socketFactory(options);
      var connected = false;

      // safe connect
      var _connect = socket.connect;
      socket.connect = function () {
        if (!connected) {
          _connect.apply(this, arguments);
          connected = true;
        }
        return socket;
      };

      // safe disconnect
      var _disconnect = socket.disconnect;
      socket.disconnct = function () {
        if (connected) {
          _disconnect.apply(this, arguments);
          connected = false;
        }
      };

      // bind listeners lifetime to ng-scope
      socket.bindTo = function (scope) {
        var scopeSocket = angular.copy(socket);
        var listeners = [];

        scopeSocket.on = function (eventName, callback) {
          if (socket) {
            socket.on(eventName, callback);
            listeners.push({ eventName: eventName, callback: callback });
          }
        };

        // remove listeners once scope destroyed
        scope.$on('$destroy', function () {
          _.each(listeners, function (listener) {
            socket.removeListener(listener.eventName, listener.callback);
          });
        });

        return scopeSocket;
      };

      return socket;
    };
  }
]);
