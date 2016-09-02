'use strict'
/* globals angular */
// Setting up route
angular.module('core.editor.routes').config([ '$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('editor', {
        url: '/editor',
        templateUrl: 'modules/users/client/views/productEditor/productEditor.parent.html',
        data: {
          roles: [ 1010, 1011, 1004 ]
        }
      })
      .state('curator', {
        url: '/curator',
        template: '<ui-view/>',
        data: {
          role: [ 1011, 1004 ]
        },
        abstract: true
      })
  }
])
