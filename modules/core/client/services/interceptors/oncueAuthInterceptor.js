angular.module('core')
  .factory('oncueAuthInterceptor', function (authToken, constants) {
    return {
      request: function (config) {
        // ignore cardkit requests
        if (config.url.toLowerCase().indexOf(constants.CARDKIT_URL.toLowerCase()) >= 0) {
          return config
        }

        var token = authToken.getToken()  // Gets token from local storage
        if (token) {
          config.headers.Authorization = 'Bearer ' + token  // Attaches token to header with Bearer tag
        }
        return config
      },
      response: function (response) {
        return response
      }
    }
  })
