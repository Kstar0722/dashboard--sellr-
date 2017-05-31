(function() {
    'use strict';

    angular.module('cardkit.core').service('PostMessage', ['$rootScope', function($rootScope) {
        var context

        $rootScope.$on('$messageIncoming', function(event, data) {
            // console.log('in', data);
            // $('<div>').text('in:' + JSON.stringify(data || event)).appendTo(document.body);
        });

        this.on = function(eventName, callback) {
            var listener = $rootScope.$on('$messageIncoming', function(event, msg) {
                msg = angular.fromJson(msg);
                if (eventName && msg.event && eventName.toLowerCase() == msg.event.toLowerCase()) {
                    callback(msg.data);
                }
            });

            if (context) {
                context.$postListeners = context.$postListeners || []
                context.$postListeners.push(listener)
            }

            return listener;
        };

        this.send = function(eventName, data) {
            $rootScope.sender = window.parent;
            // console.log('out', eventName, data);
            var msg = { event: eventName, data: data };
            // $('<div>').text('out:' + JSON.stringify(msg)).appendTo(document.body);
            return $rootScope.$broadcast('$messageOutgoing', angular.toJson(msg));
        };

        this.bindTo = function (scope) {
            context = scope
            scope.$on('$destroy', function () {
                _.each(scope.$postListeners, function (listener) {
                    listener() // unsubscribe
                })
                delete scope.$postListeners
                if (context === scope) context = null
            })
        }
    }]);
})();
