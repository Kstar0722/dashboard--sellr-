'use strict'
/* globals angular */
// Setting up route
angular.module('users.editor.routes').config([ '$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('editor.products', {
        url: '/products',
        views: {
          'detail': {
            templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.html'
          }
        }
      })
      .state('editor.view', {
        url: '/view/:productId',
        views: {
          'detail': {
            templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.view.html'
          }
        }
      })
      .state('editor.edit', {
        url: '/edit/:productId',
        views: {
          'detail': {
            templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.edit.html'
          }
        }
      })
      .state('editor.merge', {
        url: '/merge',
        views: {
          'detail': {
            templateUrl: 'modules/users/client/views/productEditor/productEditor.merge.html'
          }
        }
      })
      .state('editor.match', {
        url: '/match/:id?status',
        views: {
          'detail': {
            templateUrl: 'modules/users/client/views/admin/storeDb.match.html'
          }
        },
        params: {
          status: null
        }
      })
      .state('editor.match.view', {
        url: '/view/:productId',
        views: {
          'rightSide': {
            templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.view.html'
          }
        }
      })
      .state('editor.match.edit', {
        url: '/edit/:productId',
        views: {
          'rightSide': {
            templateUrl: 'modules/users/client/views/productEditor/productEditor.detail.edit.html'
          }
        }
      })
      .state('editor.match.merge', {
        url: '/merge',
        views: {
          'rightSide': {
            templateUrl: 'modules/users/client/views/productEditor/productEditor.merge.html'
          }
        }
      })
      .state('editor.match.new', {
        url: '/new',
        views: {
          'rightSide': {
            templateUrl: 'modules/users/client/views/productEditor/productEditor.new.html',
            controller: 'newProductController'
          }
        }
      })
      .state('curator.store', {
        url: '/store',
        templateUrl: 'modules/users/client/views/admin/storeDB.client.view.html',
        controller: 'StoreDbController'
      })
  }
])
