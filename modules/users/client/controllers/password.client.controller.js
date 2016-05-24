'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator', 'constants', 'toastr', 'authToken', '$state',
    function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator, constants, toastr, authToken, $state) {
        $scope.authentication = Authentication;
        $scope.popoverMsg = PasswordValidator.getPopoverMsg();

        //If user is signed in then redirect back home
        if ($scope.authentication.user) {
            $location.path('/');
        }


        // Change user password
        $scope.resetUserPassword = function (isValid) {
            $scope.success = $scope.error = null;
            var resetObj = {
                payload: {
                    token: $location.search().token,
                    username: $location.search().username,
                    newPass: $scope.passwordDetails.newPassword
                }
            };
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

                return false;
            }
            console.log('new pass details %0', resetObj);
            $http.post(constants.API_URL + '/users/auth/reset', resetObj).then(function (response, err) {
                if (err) {
                    toastr.error('Invalid Token. Please contact support at support@getsellr.com')
                }
                var userLogin = {
                    payload: {
                        username: resetObj.payload.username,
                        password: resetObj.payload.newPass
                    }
                };

                $http.post(constants.API_URL + '/users/login', userLogin).then(function (response, err) {
                    if (err) {
                        toastr.error('Invalid Token. Please contact support at support@getsellr.com')
                    }
                    // If successful we assign the response to the global user model
                    authToken.setToken(response.data.token);
                    //set roles
                    localStorage.setItem('roles', response.data.roles);
                    //store account Id in location storage
                    localStorage.setItem('accountId', response.data.accountId);
                    //set userId
                    localStorage.setItem('roles', response.data.roles)
                    localStorage.setItem('userId', response.data.userId);
                    localStorage.setItem('userObject', JSON.stringify(response.data));
                    $scope.authentication.user = response.data;


                    $state.go('dashboard', $state.previous.params);
                })
            })
        };
        function onSigninSuccess(response) {
            console.log('hello')
            // If successful we assign the response to the global user model
            authToken.setToken(response.data.token);
            //set roles
            localStorage.setItem('roles', response.data.roles);
            //store account Id in location storage
            localStorage.setItem('accountId', response.data.accountId);
            //set userId
            localStorage.setItem('roles', response.data.roles)
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('userObject', JSON.stringify(response.data));
            $scope.authentication.user = response.data;


            $state.go('dashboard', $state.previous.params);
        }

        //We could not sign into mongo, so clear everything and show error.
        function onSigninError(err) {
            console.error(err);
            toastr.error('Failed To Connect, Please Contact Support.');
            $scope.error = err.message;
            $scope.credentials = {};
        }
    }
]);
