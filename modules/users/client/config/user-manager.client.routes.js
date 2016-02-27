'use strict';

// Setting up route
angular.module('users.manager.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('manager.dashboard', {
                url: '/dashboard',
                templateUrl: 'modules/users/client/views/manager/dashboard.client.view.html'
            })
            .state('manager.ads', {
                url: '/manager/admanager',
                templateUrl: 'modules/users/client/views/manager/admanager.client.view.html'
            })
            .state('manager.uploads', {
                url: '/manager/uploader',
                templateUrl: 'modules/users/client/views/manager/managerUpload.client.view.html'

            })

    }
]);
