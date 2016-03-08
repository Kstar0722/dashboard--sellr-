'use strict';

angular.module('users.admin').controller('inviteUserController', ['$scope', '$state', '$http', 'Authentication', 'constants', 'toastr', 'accountsService',
    function ($scope, $state, $http, Authentication, constants, toastr, accountsService) {

        $scope.myPermissions = localStorage.getItem('roles');
        $scope.accountsService = accountsService;
        $scope.authentication = Authentication;
        console.log('authentication %O', $scope.authentication)

        $scope.roles = [
            {text: 'admin', id: 1004},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            {text: 'user', id: 1003}
        ];
        $scope.user = {
            accountId: localStorage.getItem('accountId')
        };
        $scope.locations = [{'id': 'location1'}];
        $scope.removeLocationBox = false;


        $scope.addNewLocation = function (locs) {
            var newItemNo = $scope.locations.length + 1;
            $scope.locations.push({'id': 'location' + newItemNo});
            $scope.removeLocationBox = true;
        };
        $scope.removeLocation = function () {
            if ($scope.locations.length > 1) {
                var newItemNo = $scope.locations.length - 1;

                $scope.locations.pop();
            }
            if ($scope.locations.length == 1)
                $scope.removeLocationBox = false;


        };


        $scope.toggleRole = function (roleId) {
            $scope.user.roles = $scope.user.roles || [];

            //if role exists, remove it
            if ($scope.user.roles.indexOf(roleId) > -1) {
                $scope.user.roles.splice($scope.user.roles.indexOf(roleId), 1);

            }
            else {
                //insert role
                $scope.user.roles.push(roleId);
            }
        }
        console.log('userRoles %O', $scope.user.roles);

        $scope.invite = function (isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }
            else {
                var payload = {
                    payload: $scope.user
                };
                debugger;

                $http.post(constants.API_URL + '/users', payload).then(onInviteSuccess, onInviteError);

            }
        };
        function onInviteSuccess(response) {
            toastr.success('User Invited', 'Invite Success!');
            console.dir(response);
            $state.go($state.previous.state.name || 'home', $state.previous.params);
        }

        function onInviteError(err) {
            toastr.error('There was a problem inviting this user.');
            console.error(err)
        }
    }
]);
