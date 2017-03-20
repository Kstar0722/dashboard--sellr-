angular.module('core').controller('BrandProductsController', function ($scope, globalClickEventName, $rootScope) {
  //
  // DEFINITIONS - INITIALIZATION
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.checkArray = []
  $scope.products =
  [
    {
      id: 111,
      name: 'Hornitos',
      skus: '88857003382;88857003382;88857003344;88857003344;88857003306;88857003375;88857003306;88857003375;88857003306;88857003375;',
      plans: 'October'
    },
    {
      id: 222,
      name: 'Hornitos Spicy Cucumber Margarita',
      skus: '88857003382;88857003382;',
      plans: 'March'
    },
    {
      id: 333,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    }
  ]
  _.each($scope.products, function (p) {
    $scope.ui.checkArray[p.id] = false
  })

  //
  // SCOPE FUNCTIONS
  //
  $scope.openMenu = function (menu) {
    closeMenus()
    $scope.ui[menu] = true
  }

  $scope.allChecksChange = function (forceSelectAll) {
    var flag
    if (forceSelectAll) {
      flag = true
    } else {
      $scope.ui.allCheck ? flag = true : flag = false
    }
    _.each($scope.products, function (p) {
      $scope.ui.checkArray[p.id] = flag
    })
    checkTableHeaderChange()
  }

  $scope.checkChange = function () {
    checkTableHeaderChange()
  }

  //
  // INTERNAL FUNCTIONS
  //
  function closeMenus () {
    $scope.ui.programOptionsSelect = false
    $scope.ui.productPlanOptionsSelect = false
  }

  function checkTableHeaderChange () {
    _.some($scope.ui.checkArray) ? $scope.ui.makePlanHeader = true : $scope.ui.makePlanHeader = false
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
