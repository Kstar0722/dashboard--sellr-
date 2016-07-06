'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('admin.accounts', {
                url: '/accounts',
                templateUrl: 'modules/users/client/views/admin/accountManager.client.view.html',
                controller: 'AccountManagerController'
            })
            .state('admin.accounts.edit', {
                url: '/edit/:id',
                templateUrl: 'modules/users/client/views/admin/accountManager.edit.client.view.html'
            })
            .state('admin.accounts.create', {
                url: '/new',
                templateUrl: 'modules/users/client/views/admin/accountManager.create.client.view.html'
            })
            .state('admin.users', {
                url: '/users',
                templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
                controller: 'UserListController'
            })
            .state('admin.users.edit', {
                url: '/:userId',
                templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
                controller: 'UserController',
                resolve: {
                    userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
                        return Admin.get({
                            userId: $stateParams.userId
                        });
                    }]
                }
            })
            .state('admin.users.store', {
                templateUrl: 'modules/users/client/views/admin/invite-user.client.view.html',
                controller: 'inviteUserController'

            })
            .state('admin.users.user-edit', {
                url: '/:userId/edit',
                templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
                controller: 'UserController',
                resolve: {
                    userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
                        return Admin.get({
                            userId: $stateParams.userId
                        });
                    }]
                }
            })
            .state('admin.pricing', {
                url: '/admin/pricing',
                templateUrl: 'modules/users/client/views/admin/pricing.client.view.html',
                controller: 'AdminPricingController'

            })
            .state('admin.device', {
                url: '/admin/device',
                templateUrl: 'modules/users/client/views/admin/device-manager.client.view.html',
                controller: 'DeviceManagerController'

            })
            .state('admin.store', {
                url: '/admin/store',
                templateUrl: 'modules/users/client/views/admin/storeDB.client.view.html',
                controller: 'StoreDbController'

            })
    }
]);
