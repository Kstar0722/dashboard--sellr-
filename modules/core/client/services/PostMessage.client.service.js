'use strict'

angular.module('core').service('PostMessage', ['$rootScope', function ($rootScope) {
  $rootScope.$on('$messageIncoming', function (event, data) {
        // console.log('in', data);
  })

  this.on = function (eventName, callback) {
    $rootScope.$on('$messageIncoming', function (event, msg) {
      msg = angular.fromJson(msg)
      if (eventName && msg.event && eventName.toLowerCase() === msg.event.toLowerCase()) {
        callback(msg.data)
      }
    })
  }

  this.send = function (eventName, data) {
        // console.log('out', eventName, data);
    var msg = { event: eventName, data: data }
    return $rootScope.$emit('$messageOutgoing', angular.toJson(msg))
  }
}])
