'use strict';

// Setting up route
angular.module('core.manager.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('manager', {
                abstract: true,
                url: '',
                template: '<ui-view/>',
                data: {
                    roles: [1002]
                }
            });
    }
]);
