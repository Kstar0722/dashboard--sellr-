angular.module('core')
  .factory('oncueAuthInterceptor', function (authToken) {
    return {
      request: function (config) {
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

