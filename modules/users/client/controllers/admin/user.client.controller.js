'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve', '$timeout', 'CurrentUserService', 'constants', '$http', 'toastr', '$q',
    function ($scope, $state, Authentication, userResolve, $timeout, CurrentUserService, constants, $http, toastr, $q) {


        $scope.authentication = Authentication;
        $scope.user = userResolve;

        console.log('userResolve %O', userResolve);

        $timeout(function () {
            $scope.roles = [
                {text: 'admin', id: 1004, selected: $scope.user.roles.indexOf(1004) > -1},
                {text: 'owner', id: 1009, selected: $scope.user.roles.indexOf(1009) > -1},
                {text: 'manager', id: 1002, selected: $scope.user.roles.indexOf(1002) > -1},
                {text: 'supplier', id: 1007, selected: $scope.user.roles.indexOf(1007) > -1},
                { text: 'user', id: 1003, selected: $scope.user.roles.indexOf(1003) > -1 },
                { text: 'editor', id: 1010, selected: $scope.user.roles.indexOf(1010) > -1 },
                { text: 'curator', id: 1011, selected: $scope.user.roles.indexOf(1011) > -1 }
            ];
        }, 500);



        $scope.update = function (isValid) {
            console.dir(isValid);
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }

                updateAPI();

        };

        function updateAPI() {
            $scope.user.roles = [];
            $scope.roles.forEach(function (role) {
                if (role.selected) {
                    $scope.user.roles.push(role.id)
                }
            });
            var user = $scope.user;

            console.log('userBeingEditied %O', user);
            var url = constants.API_URL + '/users/' + user.userId;
            var payload = {
                payload: user
            };
            $http.put(url, payload).then(onUpdateSuccess, onUpdateError);

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
