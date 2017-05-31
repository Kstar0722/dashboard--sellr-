"use strict";

angular
    .module('cardkit.core')
    .directive('ngIncludeNoscope', function() {
        return {
            restrict: 'AE',
            templateUrl: function(elem, attrs) {
                return elem.scope().$eval(attrs.ngIncludeNoscope);
            }
        };
    });
