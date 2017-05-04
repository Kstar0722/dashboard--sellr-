angular.module('core').controller('UsersManagerController', function ($scope, $state, $rootScope, globalClickEventName, CurrentUserService, toastr, accountsService, $http, constants, Users, $mdDialog, Authentication) {
  //
  // DEFINITIONS
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.sortExpression = '+displayName'
  $scope.ui.currentUser = {}
  $scope.CurrentUserService = CurrentUserService
  $scope.accountSelectConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'accountId',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }
  $scope.rolesSelectConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'roles',
    labelField: 'label',
    sortField: 'label',
    searchField: [ 'label' ]
  }
  $scope.rolesSelectOptions = [
    {
      label: 'Administrator',
      roles: [1002, 1003, 1004, 1007, 1009, 1010, 1011]
    },
    {
      label: 'Owner',
      roles: [1002, 1003, 1009]
    },
    {
      label: 'Manager',
      roles: [1002, 1003, 1007]
    },
    {
      label: 'Supplier',
      roles: [1003, 1007]
    },
    {
      label: 'Editor',
      roles: [1003, 1010]
    },
    {
      label: 'Curator',
      roles: [1003, 1010, 1011]
    }
  ]
  var confirmationDialogOptions = {
    templateUrl: '/modules/core/client/views/popupDialogs/confirmationDialog.html',
    autoWrap: true,
    parent: angular.element(document.body),
    scope: $scope,
    preserveScope: true,
    hasBackdrop: true,
    clickOutsideToClose: true,
    escapeToClose: true,
    fullscreen: true
  }

  //
  // INITIALIZATION
  //
  accountsService.loadAccounts().then(function () {
    $scope.accountSelectOptions = accountsService.accounts
  })

  //
  // SCOPE FUNCTIONS
  //
  $scope.reOrderList = function (field) {
    var oldSort = $scope.ui.sortExpression || ''
    var asc = true
    if (oldSort.substr(1) === field) asc = oldSort[0] === '-'
    $scope.ui.sortExpression = (asc ? '+' : '-') + field
    return $scope.ui.sortExpression
  }

  $scope.openInviteUserSidebar = function () {
    $scope.ui.currentUser = {}
    $scope.ui.display = 'inviteUser'
  }

  $scope.openEditUserSidebar = function (user, index) {
    $scope.ui.activeIndex = index
    var rolesTemp = user.roles
    rolesTemp = rolesTemp.split(',')
    rolesTemp = _.map(rolesTemp, function (strNum) { return Authentication.rolesMap[strNum] })
    rolesTemp = _.sortBy(rolesTemp, function (num) { return num })
    rolesTemp = _.reduce(rolesTemp, function (memo, roleString) {
      return memo + roleString + ','
    }, '')
    rolesTemp = rolesTemp.substring(0, rolesTemp.length - 1)
    $scope.ui.currentUser = user
    $scope.ui.currentUser.roles = rolesTemp
    $scope.ui.display = 'editUser'
  }

  $scope.submitUser = function (formValid) {
    $scope.ui.roleRequired = false
    $scope.ui.accountRequired = false
    var flag = formValid
    if (!$scope.ui.currentUser.accountId) {
      $scope.ui.accountRequired = true
      flag = false
    }
    if (!$scope.ui.currentUser.roles) {
      $scope.ui.roleRequired = true
      flag = false
    }
    if (!flag) {
      return false
    }
    // Selectize do not support array as value so need to reconvert back to array
    $scope.ui.currentUser.roles = $scope.ui.currentUser.roles.split(',')
    $scope.ui.currentUser.displayName = $scope.ui.currentUser.firstName + ' ' + $scope.ui.currentUser.lastName
    var payload
    if ($scope.ui.display === 'inviteUser') {
      payload = {
        payload: $scope.ui.currentUser
      }
      $http.post(constants.API_URL + '/users', payload).then(onSaveSuccess, onSaveError)
    }
    if ($scope.ui.display === 'editUser') {
      var url = constants.API_URL + '/users/' + $scope.ui.currentUser.userId
      payload = {
        payload: $scope.ui.currentUser
      }
      $http.put(url, payload).then(onSaveSuccess, onSaveError)
    }
  }

  $scope.showDeleteUserDialog = function (ev) {
    $scope.genericDialog = {}
    $scope.genericDialog.title = 'Delete User'
    $scope.genericDialog.body = 'Are you sure you want to delete this User?'
    $scope.genericDialog.actionText = 'Delete User'
    $scope.genericDialog.actionClass = 'common-btn-negative'
    $scope.genericDialog.action = function () {
      Users.deleteUserFOREVER($scope.ui.currentUser).then(function (response) {
        toastr.success('User ' + $scope.ui.currentUser.displayName + ' deleted')
        var deletedUser = _.find(CurrentUserService.userList, { userId: $scope.ui.currentUser.userId })
        _.removeItem(CurrentUserService.userList, deletedUser)
        $scope.closeDialog()
        $scope.ui.display = 'fulltable'
        $scope.ui.activeIndex = null
      }, function (error) {
        console.log(error)
        toastr.error('There was a problem deleting this user')
        $scope.closeDialog()
      })
    }
    $mdDialog.show(confirmationDialogOptions)
  }

  $scope.showResetPasswordDialog = function (ev) {
    if (!$scope.ui.currentUser.email) {
      toastr.info('Please type user email first')
      return false
    }
    $scope.genericDialog = {}
    $scope.genericDialog.title = 'Reset User Password'
    $scope.genericDialog.body = 'Are you sure you want to reset the password?'
    $scope.genericDialog.actionText = 'Reset Password'
    $scope.genericDialog.actionClass = 'common-btn-black'
    $scope.genericDialog.action = function () {
      Users.resetPassword($scope.ui.currentUser.email).then(function (response) {
        $scope.ui.currentUser.newPassword = response.data.token
        toastr.success('Success, new password is shown below')
        $scope.closeDialog()
      }, function (error) {
        $scope.ui.currentUser.newPassword = ''
        console.log('Error Forgot Password: ', error)
        toastr.error('Could not reset user password. Please contact Support')
        $scope.closeDialog()
      })
    }
    $mdDialog.show(confirmationDialogOptions)
  }

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  //
  // INTERNAL FUNCTIONS
  //
  function onSaveSuccess (response) {
    CurrentUserService.refreshUserList().then(function () {
      if ($scope.ui.display === 'inviteUser') {
        toastr.success('User invited successfully!')
      }
      if ($scope.ui.display === 'editUser') {
        toastr.success('User updated successfully!')
      }
      $scope.ui.display = 'fulltable'
      $scope.ui.activeIndex = null
      resetForm()
    })
  }

  function onSaveError (err) {
    if (err && err.data && err.data.message) {
      toastr.error(err.data.message)
    } else {
      toastr.error('There was a problem saving this user.')
    }
    resetForm()
  }

  function resetForm () {
    $scope.ui.currentUser = {}
    $scope.currentuserform.$setPristine()
    $scope.currentuserform.$setUntouched()
  }

  //
  // EVENTS
  //
})
