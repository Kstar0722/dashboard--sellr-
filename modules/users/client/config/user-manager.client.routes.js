'use strict';

// Setting up route
angular.module('users.manager.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('manager.ads', {
                url: '/manager/admanager',
                templateUrl: 'modules/users/client/views/manager/admanager.client.view.html'
            })
            .state('manager.uploads', {
                url: '/manager/uploader',
                templateUrl: 'modules/users/client/views/manager/managerUpload.client.view.html'

            })
            .state('manager.loyalty', {
                url: '/manager/loyalty',
                templateUrl: 'modules/users/client/views/manager/loyaltyManager.client.view.html'
            })
    }
]);
