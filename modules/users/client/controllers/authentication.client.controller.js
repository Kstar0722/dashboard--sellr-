'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants', 'toastr', 'authToken',
    function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, constants, toastr, authToken) {
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


        //switches between roleIds and strings for use in
        //mongoDB and OncueApi
        var roleTranslate = {
            1004: 'admin',
            1002: 'manager',
            1007: 'supplier',
            1003: 'user',
            1009: 'owner'
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
            var userUpdate = {
                payload: {
                    email: $scope.credentials.email,
                    username: $scope.credentials.username,
                    password: $scope.credentials.password,
                    userId: userInfo.regCode
                }
            };
            var url = constants.API_URL + '/users/' + userInfo.regCode;
            debugger;
            $http.put(url, userUpdate).then(onUpdateSuccess, onUpdateError)

        }

        //Reg code (userId) was invalid. Show error and reset credentials.
        function onInvalidReg(err) {
            toastr.error('User is not a valid user. Please contact support.');
            console.error(err);
            $scope.credentials = {}
        }

        //User updated users table in API successfully (registered in OnCue db) Update Mongo DB and sign in.
        function onUpdateSuccess(apiRes) {
            if (apiRes) {
                $scope.credentials.roles = [];
                userInfo.roles.forEach(function (role) {
                    $scope.credentials.roles.push(roleTranslate[role])
                });
                console.log('$scope credentials', $scope.credentials);
                $http.post('/api/auth/signup', $scope.credentials).then(function (response, err) {
                    console.log('mongoAPI says %O', response);
                    if (err) {
                        toastr.error('There was an error creating your account');
                        console.error(err)
                    }


                    // If successful we assign the response to the global user model
                    $scope.authentication.user = response.data;

                    var roles = [];
                    userInfo.roles.forEach(function (role) {
                        roles.push(role)
                    });

                    localStorage.setItem('accountId', userInfo.accountId);
                    localStorage.setItem('roles', roles);

                    toastr.success('Success! User Created. Logging you in now...');
                    // And redirect to the previous or home page
                    $state.go('manager.dashboard');
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
            var url = constants.API_URL + "/users/login";
            var payload = {
                payload: $scope.credentials
            };
            console.log('i hope I can sign in with %O',payload);
            $http.post(url, payload).then(onSigninSuccess, onSigninError);

        };

        //We've signed into the mongoDB, now lets authenticate with OnCue's API.
        function onSigninSuccess(response) {
            // If successful we assign the response to the global user model
            authToken.setToken(response.data.token);

            //set roles
            localStorage.setItem('roles', response.data.roles);

            //store account Id in location storage
            localStorage.setItem('accountId', response.data.accountId);

            $http.post('/api/auth/signin', $scope.credentials).then(onApiSuccess, onSigninError);
        }

        function onApiSuccess(response){
            $scope.authentication.user = response.data;
            toastr.success('Welcome to the OnCue Dashboard', 'Success');

            $state.go($state.previous.state.name || 'manager.dashboard', $state.previous.params);

        }
        //We could not sign into mongo, so clear everything and show error.
        function onSigninError(err) {
            console.error(err);
            toastr.error('Failed To Connect, Please Contact Support.');
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
