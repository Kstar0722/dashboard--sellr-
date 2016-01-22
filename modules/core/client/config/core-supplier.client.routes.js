'use strict';

// Setting up route
angular.module('core.supplier.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('supplier', {
                abstract: true,
                url: '/supplier',
                template: '<ui-view/>',
                data: {
                    roles: ['supplier']
                }
            });
    }
]);
