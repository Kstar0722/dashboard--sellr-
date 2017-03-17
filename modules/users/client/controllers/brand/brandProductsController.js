angular.module('core').controller('BrandProductsController', function ($scope) {
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.checkArray = []
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
    console.log($scope.ui.checkArray)
    checkTableHeaderChange()
  }
  function checkTableHeaderChange () {
    _.some($scope.ui.checkArray) ? $scope.ui.makePlanHeader = true : $scope.ui.makePlanHeader = false
  }
  //
  // INITIALIZATION
  //
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
})
