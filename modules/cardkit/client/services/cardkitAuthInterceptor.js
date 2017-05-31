angular.module('cardkit.core')
  .factory('cardkitAuthInterceptor', function (constants) {
    return {
      request: function (config) {
        if (config.url.toLowerCase().indexOf(constants.CARDKIT_URL.toLowerCase()) >= 0) {
          config.withCredentials = true
        }

        return config
      }
    }
  })
