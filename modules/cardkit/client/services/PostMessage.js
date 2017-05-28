(function() {
    'use strict';

    angular.module('cardkit.core').service('PostMessage', ['$rootScope', function($rootScope) {
        $rootScope.$on('$messageIncoming', function(event, data) {
            // console.log('in', data);
            // $('<div>').text('in:' + JSON.stringify(data || event)).appendTo(document.body);
        });

        this.on = function(eventName, callback) {
            $rootScope.$on('$messageIncoming', function(event, msg) {
                msg = angular.fromJson(msg);
                if (eventName && msg.event && eventName.toLowerCase() == msg.event.toLowerCase()) {
                    callback(msg.data);
                }
            });
        };

        this.send = function(eventName, data) {
            $rootScope.sender = window.parent;
            // console.log('out', eventName, data);
            var msg = { event: eventName, data: data };
            // $('<div>').text('out:' + JSON.stringify(msg)).appendTo(document.body);
            return $rootScope.$broadcast('$messageOutgoing', angular.toJson(msg));
        };
    }]);
})();
