'use strict'

angular.module('core').controller('inviteUserController', ['$scope', '$state', '$http', 'Authentication', 'constants', 'toastr', 'accountsService', '$mdDialog', '$timeout', 'CurrentUserService', 'Users',
  function ($scope, $state, $http, Authentication, constants, toastr, accountsService, $mdDialog, $timeout, CurrentUserService, Users) {
    $scope.myPermissions = localStorage.getItem('roles')
    $scope.accountsService = accountsService
    $scope.authentication = Authentication
    console.log('authentication %O', $scope.authentication)
    $scope.allRoles = [
            {text: 'admin', id: 1004},
            {text: 'owner', id: 1009},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            { text: 'user', id: 1003 },
            { text: 'editor', id: 1010 },
            { text: 'curator', id: 1011 }
    ]
    $scope.roles = [
            {text: 'admin', id: 1004},
            {text: 'owner', id: 1009},
            {text: 'manager', id: 1002},
            {text: 'supplier', id: 1007},
            { text: 'editor', id: 1010 },
            { text: 'curator', id: 1011 }
    ]
    $scope.user = {
      accountId: localStorage.getItem('accountId')
    }

    $scope.invite = function (isValid) {
      switch ($scope.selected) {
        case 1004:
          $scope.user.roles = [1004, 1009, 1002, 1007, 1003, 1010, 1011]
          break
        case 1009:
          $scope.user.roles = [1009, 1002, 1003]
          break
        case 1002:
          $scope.user.roles = [1002, 1007, 1003]
          break
        case 1007:
          $scope.user.roles = [1007, 1003]
          break
        case 1010:
          $scope.user.roles = [1010, 1003]
          break
        case 1011:
          $scope.user.roles = [1011, 1010, 1003]
          break
        default:
          $scope.user.roles = [1003]
      }

      console.log('user roes', $scope.user.roles)
      if (!isValid) {
        console.log('failed')
        $scope.$broadcast('show-errors-check-validity', 'userForm')
        return false
      } else {
        var payload = {
          payload: $scope.user
        }
        console.log(payload.payload)
        $http.post(constants.API_URL + '/users', payload).then(onInviteSuccess, onInviteError)
                // onInviteSuccess('true')
      }
    }
    function onInviteSuccess (response) {
      console.log('success!')
      toastr.success('User Invited', 'Invite Success!')
      console.dir(response)
      $scope.success = true
      $scope.cancel()
      CurrentUserService.userList.push(Users.initUser(response.data))
    }

    function onInviteError (err) {
      if (err && err.data && err.data.message) {
        toastr.error(err.data.message)
      } else {
        toastr.error('There was a problem inviting this user.')
      }
      console.error('Error creating user', err)
    }

    $scope.cancel = function () {
      $mdDialog.cancel()
      $timeout(function () { $state.go('admin.users') }, 400)
    }

    init()

    function init () {
      $mdDialog.show({
        contentElement: '.md-dialog-container',
        onRemoving: $scope.cancel,
        focusOnOpen: false
      })
    }
  }
])
