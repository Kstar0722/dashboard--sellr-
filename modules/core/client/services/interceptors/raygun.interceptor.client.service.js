angular.module('core')
    .factory('errorInterceptor', function ($q, Authentication) {
        if (!window.Raygun) return {};
        return {
            'requestError': function (rejection) {
                if (rejection.data) {
                    var title = rejection.data.message || JSON.stringify(rejection.data);
                }
                Raygun.send(new Error(title), { error: rejection, user: Authentication.user });
                return $q.reject(rejection);

            },
            'responseError': function (rejection) {
                if (rejection.data) {
                    var title = rejection.data.message || JSON.stringify(rejection.data);
                }
                Raygun.send(new Error(title), { error: rejection, user: Authentication.user });
                return $q.reject(rejection);
            }
        }
    });
