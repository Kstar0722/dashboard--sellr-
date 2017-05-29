'use strict'

angular.module('core').factory('authInterceptor', ['$q', '$injector', 'constants',
  function ($q, $injector, constants) {
    return {
      responseError: function (rejection) {
        if (rejection.config) {
          if (!rejection.config.ignoreAuthModule) {
            switch (rejection.status) {
              case 401:
                // ignore cardkit requests
                if (rejection.config.url.toLowerCase().indexOf(constants.CARDKIT_URL.toLowerCase()) >= 0) {
                  break
                }

                $injector.get('$state').transitionTo('authentication.signin')
                break
              case 403:
                $injector.get('$state').transitionTo('forbidden')
                break
            }
          }
        }

          // otherwise, default behaviour
        return $q.reject(rejection)
      }
    }
  }
])
