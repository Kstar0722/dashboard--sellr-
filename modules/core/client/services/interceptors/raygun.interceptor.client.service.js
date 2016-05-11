angular.module('core')
    .factory('errorInterceptor', function ($q, Authentication) {
        return {
            'requestError': function (rejection) {
                var title = rejection.data.message || JSON.stringify(rejection.data);
                Raygun.send(new Error(title), { error: rejection, user: Authentication.user });
                return $q.reject(rejection);

            },
            'responseError': function (rejection) {
                var title = rejection.data.message || JSON.stringify(rejection.data);
                Raygun.send(new Error(title), { error: rejection, user: Authentication.user });
                return $q.reject(rejection);

            }
        }
    });
