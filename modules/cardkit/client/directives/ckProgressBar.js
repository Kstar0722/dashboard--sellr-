"use strict";

angular
    .module('cardkit.core')
    .directive('ckProgressBar', function() {
        return {
            restrict: 'E',
            scope: {
                progress: '=value'
            },
            replace: true,
            templateUrl: '/modules/core/directives/ckProgressBar.html',
            link: function(scope, element, attrs) {
            }
        };
    });
