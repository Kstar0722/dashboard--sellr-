'use strict'

angular.module('core').service('PostMessage', ['$rootScope', function ($rootScope) {
  var context;

  $rootScope.$on('$messageIncoming', function (event, data) {
        // console.log('in', data);
  })

  this.on = function (eventName, callback) {
    var listener = $rootScope.$on('$messageIncoming', function (event, msg) {
      msg = angular.fromJson(msg)
      if (eventName && msg.event && eventName.toLowerCase() === msg.event.toLowerCase()) {
        callback(msg.data)
      }
    })

    if (context) {
      context.$postListeners = context.$postListeners || []
      context.$postListeners.push(listener)
    }
  }

  this.send = function (eventName, data) {
        // console.log('out', eventName, data);
    var msg = { event: eventName, data: data }
    return $rootScope.$emit('$messageOutgoing', angular.toJson(msg))
  }

  this.bindTo = function (scope) {
    context = scope
    scope.$on('$destroy', function () {
      _.each(scope.$postListeners, function(listener) {
        listener() // unsubscribe
      })
      delete scope.$postListeners
      if (context === scope) context = null
    })
  }
}])
