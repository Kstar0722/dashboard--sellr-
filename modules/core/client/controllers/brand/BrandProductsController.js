angular.module('core').controller('BrandProductsController', function ($scope, globalClickEventName, $rootScope) {
  //
  // DEFINITIONS
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
    },
    {
      id: 1234,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 4,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 5,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 6,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 7,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 8,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 9,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 12,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 13,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 14,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 15,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 16,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 17,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 18,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 19,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 219,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    },
    {
      id: 229,
      name: 'Cucumber Drink',
      skus: '88857003382',
      plans: 'July'
    }
  ]
  $scope.selectPrograms = [{name: 'Program 1'}, {name: 'Program 2'}, {name: 'Program 3'}]
  $scope.selectProgramConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'name',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }

  //
  // INITIALIZATION
  //
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
    $scope.ui.productPlanOptionsSelect = false
    $scope.ui.planStoresOptionsSelect = false
    $scope.ui.planStatusOptionsSelect = false
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
