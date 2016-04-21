'use strict';

// Setting up route
angular.module('core.curator.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('curator', {
                abstract: true,
                url: '',
                template: '<ui-view/>',
                data: {
                    roles: ['curator']
                }
            });
    }
]);
