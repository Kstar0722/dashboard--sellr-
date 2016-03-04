'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants', 'toastr',
    function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, constants, toastr) {
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
            $http.get(constants.API_URL + '/store/validate/' + $scope.regCode).then(onValidReg, onInvalidReg);

            function onValidReg(response) {
                console.log('reg code validate %O', response);
                // If successful we assign the response to the global user model
                var check = response.data;
                localStorage.setItem('roles', JSON.stringify(response.data.roles));
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
                    $http.post(constants.API_URL + '/store/update', storeUpdate).then(onUpdateSuccess, onUpdateError)
                }
            }

            function onInvalidReg(err) {
                toastr.error('User is not a valid user. Please contact support.')

                console.error(err);
                $scope.error = err
            }
        };

        function onUpdateSuccess(res) {
            if (res) {
                $http.post('/api/auth/signup', $scope.credentials).then(function (response, err) {
                    if (err) {
                        toastr.error(err.message)
                        console.error(err)
                    }
                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response;
                    toastr.success('Success! User Created. Logging you in now...');
                    // And redirect to the previous or home page
                    $state.go($state.previous.state.name || 'home', $state.previous.params);
                })
            }
        }

        function onUpdateError(err) {
            toastr.err(err.message);
            $scope.error = res.message;
            console.error(err)
        }

        $scope.signin = function (isValid) {
            $scope.error = null;

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }


            $http.post('/api/auth/signin', $scope.credentials).then(onSigninSuccess, onSigninError)
        };

        function onSigninSuccess(response) {
            // If successful we assign the response to the global user model
            $scope.authentication.user = response.data;
            $http.get(constants.API_URL + '/accounts/user/' + $scope.authentication.user.username).then(function (response, err) {
                if (err) {
                    toastr.error(err)
                    console.error(err);
                }
                toastr.success('Welcome to the Oncue Dashboard', 'Success')
                console.log('response from getUser %O', response);
                var roles = [];
                response.data.forEach(function (role) {
                    roles.push(role.roleId)
                });
                localStorage.setItem('accountId', Number(response.data[0].accountId));
                localStorage.setItem('roles', roles);


            });
            // And redirect to the previous or home page
            $state.go($state.previous.state.name || 'manager.dashboard', $state.previous.params);
        }


        function onSigninError(err) {

            console.error(err);
            toastr.error(err.data.message);
            $scope.error = err.message;

        }

        // OAuth provider request
        $scope.callOauthProvider = function (url) {
            if ($state.previous && $state.previous.href) {
                url += '?redirect_to=' + encodeURIComponent($state.previous.href);
            }

            // Effectively call OAuth authentication route:
            $window.location.href = url;
        };
    }
]);
