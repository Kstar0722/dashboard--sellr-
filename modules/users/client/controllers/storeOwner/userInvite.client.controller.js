'use strict';

angular.module('users.admin').controller('StoreOwnerInviteController', [ '$scope','Authentication', '$filter', 'Admin', '$http', '$state', 'CurrentUserService', 'constants', 'accountsService', 'toastr',
    function ($scope,Authentication, $filter, Admin, $http, $state, CurrentUserService, constants, accountsService, toastr) {


        $scope.CurrentUserService = CurrentUserService;
        $scope.userview = $state.params;
        //CurrentUserService.user = '';
        $scope.locations = [];


        if (CurrentUserService.locations)
            $scope.locations = CurrentUserService.locations;
        else
            $scope.locations = ["No Locations"]
        $scope.addLocs = function () {
            console.log('helllo, %O', $scope.locations);
        }

        $scope.userEditView = function (user) {
            //debugger;

            $http.get(constants.API_URL + '/users?email=' + user.email).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    console.log(res);
                    CurrentUserService.userBeingEdited = res.data[0];
                    $state.go('admin.users.user-edit', {userId: user._id});
                    console.log('currentUserService userBeingEdited %O', CurrentUserService.userBeingEdited)
                }
            })
        };

        $scope.inviteStoreView = function () {
            $state.go('admin.users.store', {}, {reload: true})
        };


        $scope.buildPager = function () {
            $scope.pagedItems = [];
            $scope.itemsPerPage = 15;
            $scope.currentPage = 1;
            $scope.figureOutItemsToDisplay();
        };

        $scope.figureOutItemsToDisplay = function () {

            $scope.filteredItems = $filter('filter')(CurrentUserService.userList, {
                $: $scope.search
            });
            $scope.newUsers = $scope.filteredItems
        };
        $scope.buildPager();
        $scope.pageChanged = function () {
            $scope.figureOutItemsToDisplay();
        };
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
        $scope.myPermissions = localStorage.getItem('roles');
        $scope.accountsService = accountsService;
        $scope.authentication = Authentication;
        console.log('authentication %O', $scope.authentication)

        $scope.roles = [
            {text: 'admin', id: 1004},
            {text: 'store owner', id: 1006},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            {text: 'user', id: 1003}
        ];
        $scope.user = {
            accountId: localStorage.getItem('accountId')
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
