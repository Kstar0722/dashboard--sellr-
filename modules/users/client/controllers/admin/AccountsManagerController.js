angular.module('core').controller('AccountsManagerController', function ($scope, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, UsStates, $mdDialog, $timeout, $httpParamSerializer, $rootScope, globalClickEventName) {
  //
  // DEFINITIONS - INITIALIZATION
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'

  //
  // SCOPE FUNCTIONS
  //
  $scope.openMenu = function (menu) {
    closeMenus()
    $scope.ui[menu] = true
  }

  //
  // INTERNAL FUNCTIONS
  //
  function closeMenus () {
    $scope.ui.filterOptionsSelect = false
    $scope.ui.actionsOptionsSelect = false
    $scope.ui.stateOptionsSelect = false
    $scope.ui.websiteThemesOptionsSelect = false
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
