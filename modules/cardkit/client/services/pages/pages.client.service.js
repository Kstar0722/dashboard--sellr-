(function () {
  'use strict'

  angular
        .module('cardkit.pages')
        .factory('Pages', Pages)

  Pages.$inject = ['$resource', 'appConfig']

  function Pages ($resource, appConfig) {
    return $resource(appConfig.CARDKIT_URL + '/pages/:pageId', {
      pageId: '@pageId',
      client: '@clientName'
    }, {
      update: {
        method: 'PUT'
      },
      queryTags: {
        method: 'GET',
        url: appConfig.CARDKIT_URL + '/pages/tags/:client',
        isArray: true
      },
      editing: {
        method: 'PUT',
        url: appConfig.CARDKIT_URL + '/pages/:pageId/editing',
        isArray: true
      },
      editingDetails: {
        method: 'GET',
        url: appConfig.CARDKIT_URL + '/pages/:pageId/editing',
        isArray: true
      }
    })
  }
}())
