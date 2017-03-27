angular.module('core').controller('UsersManagerController', function ($scope, $state, $rootScope, globalClickEventName, CurrentUserService) {
  //
  // DEFINITIONS - INITIALIZATION
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.sortExpression = '+displayName'
  $scope.CurrentUserService = CurrentUserService

  //
  // SCOPE FUNCTIONS
  //
  $scope.openMenu = function (menu, index) {
    closeMenus()
    if (!_.isUndefined(index)) {
      $scope.ui[menu][index] = true
    } else {
      $scope.ui[menu] = true
    }
  }

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

  $scope.setUsState = function (state) {
    $scope.ui.currentAccount.state = state.abbreviation
    $scope.ui.currentAccount.stateName = state.name
    $scope.ui.stateError = false
  }

  //
  // INTERNAL FUNCTIONS
  //
  function closeMenus () {
    $scope.ui.filterOptionsSelect = false
    $scope.ui.stateOptionsSelect = false
    $scope.ui.websiteThemesOptionsSelect = false
    $scope.ui.actionsOptionsSelect = []
  }

  //
  // EVENTS
  //
  var unregisterGlobalClick = $rootScope.$on(globalClickEventName, function (event, targetElement) {
    if (targetElement.className.indexOf('ignore-click-trigger') === -1) {
      $scope.$apply(function () {
        closeMenus()
      })
    }
  })

  // MANDATORY to prevent Leak
  $scope.$on('$destroy', unregisterGlobalClick)
})
