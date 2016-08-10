'use strict'

/* global angular */
angular.module('users.storeOwner.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('storeOwner.inviteUser', {
        url: '/invite',
        templateUrl: 'modules/users/client/views/storeOwner/userInvite.client.view.html',
        controller: 'StoreOwnerInviteController'
      })
      .state('storeOwner.orders', {
        url: '/orders',
        templateUrl: 'modules/users/client/views/storeOwner/orders.client.view.html',
        controller: 'StoreOwnerOrdersController'
      })
  }
])
