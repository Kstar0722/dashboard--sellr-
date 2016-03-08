'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants', 'toastr',
    function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, constants, toastr) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();

        var userInfo = {};

        //read userinfo from URL
        if ($location.search().r)
            userInfo = {
                accountId: Number($location.search().a),
                regCode: Number($location.search().u),
                roles: $location.search().r.split('~')
            };

        var roleTranslate = {
            1004: 'admin',
            1002: 'manager',
            1007: 'supplier',
            1003: 'user'
        };


        // If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }

        $scope.signup = function () {
            $http.get(constants.API_URL + '/users/validate/' + userInfo.regCode).then(onValidReg, onInvalidReg);
        };


        //Reg code (userId) exists in database, continue with creation

        function onValidReg(response) {
            var storeUpdate = {
                payload: {
                    email: $scope.credentials.email,
                    username: $scope.credentials.username,
                    userId: userInfo.regCode
                }
            };
            var url = constants.API_URL + '/users/' + userInfo.regCode
            $http.put(url, storeUpdate).then(onUpdateSuccess, onUpdateError)

        }

        //Reg code (userId) was invalid. Show error and reset credentials.
        function onInvalidReg(err) {
            toastr.error('User is not a valid user. Please contact support.');
            console.error(err);
            $scope.credentials = {}
        }

        //User updated users table in API successfully (registered in OnCue db) Update Mongo DB and sign in.
        function onUpdateSuccess(res) {
            if (res) {
                $scope.credentials.roles = [];
                userInfo.roles.forEach(function (role) {
                    $scope.credentials.roles.push(roleTranslate[role])
                });
                console.log('$scope credentials', $scope.credentials);
                $http.post('/api/auth/signup', $scope.credentials).then(function (response, err) {
                    console.log('mongoAPI says %O', response)
                    if (err) {
                        toastr.error('There was an error creating your account')
                        console.error(err)
                    }

                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response.data;

                    var roles = [];
                    userInfo.roles.forEach(function (role) {
                        roles.push(Number(role.roleId))
                    });

                    localStorage.setItem('accountId', userInfo.accountId);
                    localStorage.setItem('roles', roles);

                    toastr.success('Success! User Created. Logging you in now...');
                    // And redirect to the previous or home page
                    $state.go($state.previous.state.name || 'home', $state.previous.params);
                })
            }
        }

        function onUpdateError(err) {
            toastr.error(err.message);
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
            $scope.credentials = {};
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
