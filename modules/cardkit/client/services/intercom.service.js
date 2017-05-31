'use strict';

angular.module('cardkit.core').service('IntercomSvc', function($window) {
    this.start = function(user) {
        var appId = ($window.settings.intercom || {}).appId;
        if (!appId || !$window.Intercom) return;
        user = user || {};

        $window.Intercom('boot', {
            app_id: appId,
            email: user.email ? user.email.toLowerCase() : undefined,
            user_id: user._id,
            created_at: user.created ? moment(user.created).unix() : undefined
        });
    };

    this.stop = function() {
        if (!$window.Intercom) return;
        $window.Intercom('shutdown');
    };

    this.trackEvent = function(eventName, metadata) {
        if (!$window.Intercom) return;

        if (!eventName) {
            console.error('unable to track unnamed Intercom event');
            return;
        }

        $window.Intercom('trackEvent', eventName, metadata);
    };
});
