'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve', '$timeout', 'CurrentUserService', 'constants', '$http', 'toastr',
    function ($scope, $state, Authentication, userResolve, $timeout, CurrentUserService, constants, $http, toastr) {


        $scope.authentication = Authentication;
        $scope.user = userResolve;

        $scope.roles = [
            {text: 'admin', id: 1004, selected: userResolve.roles.indexOf('admin') > -1},
            {text: 'manager', id: 1002, selected: userResolve.roles.indexOf('manager') > -1},
            {text: 'supplier', id: 1007, selected: userResolve.roles.indexOf('supplier') > -1},
            {text: 'user', id: 1003, selected: userResolve.roles.indexOf('user') > -1}
        ];


        $scope.remove = function () {
            var user = userResolve;
            if (confirm('Are you sure you want to delete this user?')) {
                if (user) {
                    user.$remove();
                    CurrentUserService.update();

                } else {
                    $scope.user.$remove(function () {
                        $state.go('admin.users');
                    });
                }
            }
        };

        $scope.update = function (isValid) {
            console.dir(isValid);
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }
            updateMongo();
            updateAPI();
        };


        function updateMongo() {
            $scope.user.roles = [];
            $scope.roles.forEach(function (role) {
                if (role.selected) {
                    $scope.user.roles.push(role.text)
                }
            });
            var user = $scope.user;
            debugger;

            user.$update(function () {
                $state.go('admin.users.user-edit', {
                    userId: user._id
                });
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        }

        function updateAPI() {
            $scope.user.roles = [];
            $scope.roles.forEach(function (role) {
                if (role.selected) {
                    $scope.user.roles.push(role.id)
                }
            });
            var user = $scope.user;
            var userBeingEdited = CurrentUserService.userBeingEdited;
            var url = constants.API_URL + '/users/' + userBeingEdited.userId;
            var payload = {
                payload: user
            };
            debugger;
            $http.post(url, payload).then(onUpdateSuccess, onUpdateError);

            function onUpdateSuccess(res) {
                toastr.success('User updated', 'Success!')
            }

            function onUpdateError(err) {
                toastr.error('There was an error updating this user');
                console.error(err)
            }
        }
    }
]);
