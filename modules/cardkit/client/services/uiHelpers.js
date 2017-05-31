'use strict';

angular.module('cardkit.core').factory('uiHelpers', uiHelpers);

uiHelpers.$Inject = ['$window', '$injector'];

function uiHelpers($window, $injector) {
    // for debugging purposes only
    $window.$svc = function(name) {
        return $window[name] = $injector.get(name);
    };
    $window.$sc = function(el) {
        return $window.$scope = angular.element(el || document.querySelector('section.content .ng-scope:first-of-type')).scope();
    };
    $window.$d = function(el) {
        ($window.$scope || $window.$sc(el)).$digest();
    };

    return {
        log: log,
        Math: Math,
        codeOf: _.codeOf,
        embedMode: _.isEmbedMode()
    };

    function log(msg) {
        console.log.apply(console, _.params(arguments));
        return msg;
    }
}
