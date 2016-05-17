'use strict';

// Setting up route
angular.module('core.storeOwner.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('storeOwner', {
                abstract: true,
                url: '',
                template: '<ui-view/>',
                data: {
                    roles: [1009]
                }
            });
    }
]);
