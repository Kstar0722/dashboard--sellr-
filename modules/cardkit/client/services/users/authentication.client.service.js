'use strict';

// Authentication service for user variables
angular.module('cardkit.users')
    .factory('Authentication', [
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
    .service('AuthenticationSvc', ['$http', '$state', '$stateParams', '$location', 'remember', 'Authentication', '$window', 'IntercomSvc',
        function($http, $state, $stateParams, $location, remember, Authentication, $window, IntercomSvc) {
            if (Authentication.user) {
                IntercomSvc.start(Authentication.user);
            }

            this.signin = function(credentials, noredirect) {
                remember('username', '');
                remember('password', '');
                return $http.post('/auth/signin', credentials).success(function(response, status, headers) {
                    var rememberToken = headers('remember_me');
                    if (rememberToken) remember('remember_me', rememberToken);
                }).then(function(response) {
                    var user = Authentication.user = response.data;
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
                return $http.get('/auth/signout', { params: noredirect ? { noredirect: true } : null })
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
                return $http.get('/auth/check').then(function(user) {
                    if (user) {
                        Authentication.user = user;
                        return user;
                    }
                    else {
                        return $state.go('signin', { returnUrl: $location.url() });
                    }
                });
            };
        }
    ]);
