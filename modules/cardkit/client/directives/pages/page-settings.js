(function() {
    'use strict';

    angular
        .module('cardkit.pages')
        .directive('pageSettings', function() {
            return {
                restrict: 'E',
                templateUrl: '/modules/pages/directives/page-settings.html',
                controller: 'PageSettingsEditorController',
                scope: {
                    page: '=',
                    clients: '=',
                    api: '='
                },
                link: function(scope, element, attrs, ctrl) {
                    scope.api = {
                        saveDetails: scope.saveDetails
                    };
                }
            };
        });

}());
