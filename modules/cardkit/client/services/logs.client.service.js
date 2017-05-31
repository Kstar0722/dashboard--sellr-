(function () {
  'use strict'

  angular
        .module('cardkit.core')
        .factory('Logs', Logs)

  Logs.$inject = ['$resource', 'appConfig']

  function Logs ($resource, appConfig) {
    return $resource(appConfig.CARDKIT_URL + '/logs')
  }
}())
