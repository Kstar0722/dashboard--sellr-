'use strict';

// Setting up route
angular.module('users.supplier.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('supplier.media', {
                url: '/supplier',
                templateUrl: 'modules/users/client/views/supplier/media.client.view.html',
                controller: 'MediaController'
            })
            .state('supplier.assets', {
                url: '/supplier/assets',
                templateUrl: 'modules/users/client/views/supplier/assets.client.view.html',
                controller: 'AssetController'
            })


    }
]);
