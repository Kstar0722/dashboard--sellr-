'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants',
    function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, constants) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();
        $scope.regCodeErrors = false;
        $scope.regCode = '';

        // Get an eventual error defined in the URL query string:
        $scope.error = $location.search().err;
        $scope.regCode = $location.search().regcode;


        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }

        $scope.signup = function (isValid) {
            $scope.error = null;
            var check = false;
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');

                return false;
            }
            console.log('hello')
            $http.get(constants.API_URL + '/store/validate/' + $scope.regCode).then(onValidReg, onInvalidReg)

            function onValidReg(response) {
                console.log('reg code validate %O', response)
                // If successful we assign the response to the global user model
                var check = response.data;
                response.data.roles.forEach(function (role) {
                    $scope.credentials.roles = $scope.credentials.roles || [];
                    $scope.credentials.roles.push(role.role)
                });

                if (check) {
                    var storeUpdate = {
                        payload: {
                            email: $scope.credentials.email,
                            username: $scope.credentials.username,
                            userId: $scope.regCode
                        }
                    };
                    $http.post(constants.API_URL + '/store/update', storeUpdate).success(function (res) {
                        if (res) {
                            $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
                                // If successful we assign the response to the global user model
                                $scope.authentication.user = response;
                                // And redirect to the previous or home page
                                $state.go($state.previous.state.name || 'home', $state.previous.params);
                            }).error(function (response) {
                                $scope.error = response.message;
                            });
                        }
                    }).error(function (res) {
                        $scope.error = res.message;
                    });
                }
            }

            function onInvalidReg(err) {
                console.error(err);
                $scope.error = err
            }
        };

        $scope.signin = function (isValid) {
            $scope.error = null;

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');

                return false;
            }


            $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
                // If successful we assign the response to the global user model
                console.log('authClientController signing %O', response);
                $scope.authentication.user = response;

                $http.get(constants.API_URL + '/accounts/user/' + $scope.authentication.user.username).then(function (response, err) {
                    if (err) {
                        console.log(err);
                    }
                    if (response) {
                        localStorage.setItem('accountId', Number(response.data[0].accountId));
                        console.log('Account Id Set In Storage', Number(response.data[0].accountId));
                    }
                });
                // And redirect to the previous or home page
                $state.go($state.previous.state.name || 'manager.dashboard', $state.previous.params);
            }).error(function (response) {
                $scope.error = response.message;
            });
        };

        // OAuth provider request
        $scope.callOauthProvider = function (url) {
            if ($state.previous && $state.previous.href) {
                url += '?redirect_to=' + encodeURIComponent($state.previous.href);
            }
<<<<<<< HEAD
          }).error(function (res) {
                console.log('signup errors %O', res)
            $scope.error = res.message;
          });
        }
=======
>>>>>>> 20dcb77a7fc4cfed87acbe3de5fa68c7fdb53802

            // Effectively call OAuth authentication route:
            $window.location.href = url;
        };
    }
]);
