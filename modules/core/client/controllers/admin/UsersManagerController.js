angular.module('core').controller('UsersManagerController', function ($scope, CurrentUserService, toastr, accountsService, $http, constants, Users, $mdDialog, Authentication, utilsService) {
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
  $scope.rolesSelectOptions = Users.rolesOptions
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
    var rolesTemp = angular.copy(user.roles)
    rolesTemp = rolesTemp.split(',')
    rolesTemp = _.map(rolesTemp, function (strNum) { return Authentication.rolesMap[strNum] })
    rolesTemp = _.sortBy(rolesTemp, function (num) { return num })
    rolesTemp = _.reduce(rolesTemp, function (memo, roleString) {
      return memo + roleString + ','
    }, '')
    rolesTemp = rolesTemp.substring(0, rolesTemp.length - 1)
    $scope.ui.currentUser = angular.copy(user)
    $scope.ui.currentUser.roles = rolesTemp
    $scope.ui.display = 'editUser'
    utilsService.setCancelAutosave($scope)
  }

  $scope.debouncedAutosaveUser = utilsService.getDebouncedFuntion(autosaveUser)

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
    var payload = {
      payload: angular.copy($scope.ui.currentUser)
    }
    completeUserPayload(payload)
    if ($scope.ui.display === 'inviteUser') {
      $http.post(constants.API_URL + '/users', payload).then(onSaveSuccess, onSaveError)
    }
    if ($scope.ui.display === 'editUser') {
      var url = constants.API_URL + '/users/' + $scope.ui.currentUser.userId
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

  $scope.showResetPasswordDialog = function (email) {
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
      Users.resetPassword(email).then(function (response) {
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
  function completeUserPayload (payload) {
    // Selectize do not support array as value so need to reconvert back to array
    payload.payload.roles = $scope.ui.currentUser.roles.split(',')
    payload.payload.displayName = $scope.ui.currentUser.firstName + ' ' + $scope.ui.currentUser.lastName
  }

  function autosaveUser () {
    if (!$scope.ui.cancelAutosave && $scope.ui.display === 'editUser' && $scope.currentuserform.$valid && $scope.ui.currentUser.accountId && $scope.ui.currentUser.roles) {
      var url = constants.API_URL + '/users/' + $scope.ui.currentUser.userId
      var payload = {
        payload: angular.copy($scope.ui.currentUser)
      }
      completeUserPayload(payload)
      $http.put(url, payload, { ignoreLoadingBar: true }).then(function () {
        CurrentUserService.refreshUserList(true)
        utilsService.setAutosaveMessage($scope)
      })
    }
  }

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
