(function() {
    "use strict";

    angular
        .module('cardkit.core')
        .factory('Logs', Logs);

    Logs.$inject = ['$resource'];

    function Logs($resource) {
        return $resource('/logs');
    }
}());
