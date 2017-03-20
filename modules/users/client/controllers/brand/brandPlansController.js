angular.module('core').controller('BrandPlansController', function ($scope, globalClickEventName, $rootScope) {
  //
  // DEFINITIONS - INITIALIZATION
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'

  //
  // SCOPE FUNCTIONS
  //
  $scope.openMenu = function (menu, openOnly) {
    switch (menu) {
      case 'planStatusOptionsSelect':
        $scope.ui.planStatusOptionsSelect = openOnly || !$scope.ui.planStatusOptionsSelect
        break
      default:
        break
    }
  }

  //
  // INTERNAL FUNCTIONS
  //

  //
  // EVENTS
  //
  var unregisterGlobalClick = $rootScope.$on(globalClickEventName, function (event, targetElement) {
    $scope.$apply(function () {
      $scope.ui.planStatusOptionsSelect = false
    })
  })
  // MANDATORY to prevent Leak
  $scope.$on('$destroy', unregisterGlobalClick)
})
