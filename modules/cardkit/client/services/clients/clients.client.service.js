'use strict'

// Clients service used to communicate Clients REST endpoints
angular.module('cardkit.clients').factory('Clients', ['$resource', 'appConfig',
  function ($resource, appConfig) {
    return $resource(appConfig.CARDKIT_URL + '/clients/:clientId', {
      clientId: '@_id', name: '@companyName', clientSlug: '@slug'
    }, {
      update: {
        method: 'PUT'
      }
    })
  }
])
