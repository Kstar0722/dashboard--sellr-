'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
          resolve: {
              userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
                  return Admin.get({
                      userId: $stateParams.userId
                  });
              }]
          }

      })
        .state('admin.users.edit', {
          url: '/users/:userId',
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
          url: '/store',
          templateUrl: 'modules/users/client/views/admin/invite-store.client.view.html',
          controller: 'StoreController'

        })
      .state('admin.users.user-edit', {
        url: '/users/:userId/edit',
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
        .state('admin.location', {
            url: '/admin/locations',
            templateUrl: 'modules/users/client/views/admin/locationManager.client.view.html',
            controller: 'AdminLocationController'

        })
        .state('admin.pricing', {
            url: '/admin/pricing',
            templateUrl: 'modules/users/client/views/admin/pricing.client.view.html',
            controller: 'AdminPricingController'

        })
  }
]);
