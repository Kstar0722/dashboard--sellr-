angular.module('core').controller('BrandPlansController', function ($scope, globalClickEventName, $rootScope) {
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
    $scope.ui.planStatusOptionsSelect = false
    $scope.ui.planStoresOptionsSelect = false
  }

  //
  // EVENTS
  //
  var unregisterGlobalClick = $rootScope.$on(globalClickEventName, function (event, targetElement) {
    if (targetElement.className.indexOf('ignore-click-trigger') === -1) {
      closeMenus()
      if (!$scope.$$phase) $scope.$digest()
    }
  })
  // MANDATORY to prevent Leak
  $scope.$on('$destroy', unregisterGlobalClick)
})
