'use strict';

// Authentication service for user variables
angular.module('cardkit.users')
    .factory('CardkitAuthentication', [
        function() {
            var _this = this;

            _this._data = {
                user: window.user,
                clients: function() {
                    var user = _this._data.user;
                    return user && _.unionItems(user.clients, user.client) || [];
                }
            };

            return _this._data;
        }
    ])
    .service('AuthenticationSvc', ['$http', '$state', '$stateParams', '$location', 'remember', 'Authentication', '$window', 'IntercomSvc', 'appConfig',
        function($http, $state, $stateParams, $location, remember, Authentication, $window, IntercomSvc, appConfig) {
            if (Authentication.cardkit.user) {
                IntercomSvc.start(Authentication.cardkit.user);
            }

            this.signin = function(credentials, noredirect) {
                remember('username', '');
                remember('password', '');
                return $http.post(appConfig.CARDKIT_URL + '/auth/signin', credentials).then(function(response) {
                    var rememberToken = response.headers('remember_me');
                    if (rememberToken) remember('remember_me', rememberToken);
                    return response;
                }).then(function(response) {
                    var user = Authentication.cardkit.user = response.data;
                    IntercomSvc.start(user);

                    if (noredirect) return user;

                    if ($stateParams.returnUrl) {
                        $location.url($stateParams.returnUrl);
                        return user;
                    }

                    return user;
                });
            };

            this.signout = function(noredirect) {
                return $http.get(appConfig.CARDKIT_URL + '/auth/signout', { params: noredirect ? { noredirect: true } : null })
                    .then(function() {
                        IntercomSvc.stop();

                        remember('remember_me', '');
                        //remember('username', '');
                        //remember('password', ''); TODO define remember me flow
                        if (noredirect) return;
                        $window.location.href = '/';
                    })
                    .catch(function(err) {
                        console.log('error', err);
                        throw err;
                    });
            };

            this.check = function() {
                return $http.get(appConfig.CARDKIT_URL + '/auth/check').then(function(user) {
                    if (user) {
                        Authentication.cardkit.user = user;
                        return user;
                    }
                    else {
                        console.warn('unauthorized');
                        // return $state.go('cardkit.signin', { returnUrl: $location.url() });
                    }
                });
            };
        }
    ]);
