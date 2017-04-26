angular.module('core').controller('UsersManagerController', function ($scope, $state, $rootScope, globalClickEventName, CurrentUserService, toastr, accountsService, $http, constants, Users) {
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
      roles: [1004, 1009, 1002, 1007, 1003, 1010, 1011]
    },
    {
      label: 'Owner',
      roles: [1009, 1002, 1003]
    },
    {
      label: 'Manager',
      roles: [1002, 1007, 1003]
    },
    {
      label: 'Supplier',
      roles: [1007, 1003]
    },
    {
      label: 'Editor',
      roles: [1010, 1003]
    },
    {
      label: 'Curator',
      roles: [1011, 1010, 1003]
    }
  ]

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

  $scope.openEditUserSidebar = function (user) {
    $scope.ui.currentUser = user
    $scope.ui.display = 'editUser'
  }
  $scope.submitUser = function (view, formValid) {
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
    // Selectize do not support array as value so need to reconvert to array
    $scope.ui.currentUser.roles = $scope.ui.currentUser.roles.split(',')
    var payload = {
      payload: $scope.ui.currentUser
    }
    $http.post(constants.API_URL + '/users', payload).then(onInviteSuccess, onInviteError)
  }

  //
  // INTERNAL FUNCTIONS
  //
  function onInviteSuccess (response) {
    toastr.success('User invited successfully!')
    CurrentUserService.userList.push(Users.initUser(response.data))
    $scope.ui.display = 'fulltable'
    resetForm()
  }
  function onInviteError (err) {
    if (err && err.data && err.data.message) {
      toastr.error(err.data.message)
    } else {
      toastr.error('There was a problem inviting this user.')
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
