'use strict';

// Setting up route
angular.module('users.manager.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('dashboard', {
                url: '/dashboard/:accountId?',
                templateUrl: 'modules/users/client/views/manager/dashboard.client.view.html'

            })
            .state('manager.ads', {
                url: '/ads/:accountId?',
                templateUrl: 'modules/users/client/views/manager/adsmanager.client.view.html',
                controller:'AdsmanagerController'
            })
            .state('manager.uploads', {
                url: '/manager/uploader',
                templateUrl: 'modules/users/client/views/manager/managerUpload.client.view.html'

            })
            .state('manager.locations', {
                url: '/manager/locations',
                templateUrl: 'modules/users/client/views/manager/locationManager.client.view.html',
                controller: 'LocationManagerController'
            })
            .state('manager.locations.edit', {
                url: '/edit/:id',
                templateUrl: 'modules/users/client/views/manager/locationManager.edit.client.view.html',
            })
            .state('manager.locations.create', {
                url: '/new',
                templateUrl: 'modules/users/client/views/manager/locationManager.create.client.view.html'
            })
            .state('manager.accounts', {
                url: '/manager/accounts',
                templateUrl: 'modules/users/client/views/manager/accountManager.client.view.html',
                controller: 'AccountManagerController'
            })
            .state('manager.accounts.edit', {
                url: '/edit/:id',
                templateUrl: 'modules/users/client/views/manager/accountManager.edit.client.view.html'
            })
            .state('manager.accounts.create', {
                url: '/new',
                templateUrl: 'modules/users/client/views/manager/accountManager.create.client.view.html'
            })

    }
]);
