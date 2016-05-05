'use strict';

angular.module('users.admin').controller('inviteUserController', ['$scope', '$state', '$http', 'Authentication', 'constants', 'toastr', 'accountsService',
    function ($scope, $state, $http, Authentication, constants, toastr, accountsService) {

        $scope.myPermissions = localStorage.getItem('roles');
        $scope.accountsService = accountsService;
        $scope.authentication = Authentication;
        console.log('authentication %O', $scope.authentication)
        $scope.allRoles = [
            {text: 'admin', id: 1004},
            {text: 'owner', id: 1009},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            { text: 'user', id: 1003 },
            { text: 'editor', id: 1010 },
            { text: 'curator', id: 1011 }
        ];
        $scope.roles = [
            {text: 'admin', id: 1004},
            {text: 'owner', id: 1009},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            { text: 'editor', id: 1010 },
            { text: 'curator', id: 1011 }
        ];
        $scope.user = {
            accountId: localStorage.getItem('accountId')
        };

        $scope.invite = function (isValid) {

            switch ($scope.selected) {
                case 1004:
                    $scope.user.roles = [1004, 1009, 1002, 1007, 1003, 1010, 1011];
                    break;
                case 1009:
                    $scope.user.roles = [1009, 1002, 1003];
                    break;
                case 1002:
                    $scope.user.roles = [1002, 1007, 1003];
                    break;
                case 1007:
                    $scope.user.roles = [1007 , 1003];
                    break;
                case 1010:
                    $scope.user.roles = [1010 , 1003];
                    break;
                case 1011:
                    $scope.user.roles = [1011 , 1010, 1003];
                    break;
                default:
                    $scope.user.roles = [1003];
            }


            console.log('user roes', $scope.user.roles);
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'userForm');
                return false;
            }
            else {
                var payload = {
                    payload: $scope.user
                };

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

