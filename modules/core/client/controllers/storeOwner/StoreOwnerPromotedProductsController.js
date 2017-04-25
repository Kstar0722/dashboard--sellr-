angular.module('core').controller('StoreOwnerPromotedProductsController', function ($scope, $stateParams, $state) {
  console.log('PROMOTED PRODUCT CTRL')
  $scope.ui = {}
  $scope.ui.icon = false
  $scope.ui.promotedProducts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  $scope.ui.selectedProduct = []
  $scope.ui.channelsIconsTriggers = []
  $scope.displayTooltip = function (index, iconIndex, $event) {
    $scope.ui.channelsIconsTriggers[index][iconIndex] = true
    $event.stopPropagation()
  }
  $scope.selectProduct = function (index) {
    if (!$scope.ui.selectedProduct[index]) {
      $scope.ui.selectedProduct = []
      $scope.ui.selectedProduct[index] = true
    } else {
      $scope.ui.selectedProduct = []
    }
  }
  var i, j
  var len = $scope.ui.promotedProducts.length
  for (i = 0; i < len; i++) {
    $scope.ui.channelsIconsTriggers[i] = []
    for (j = 0; j < 4; j++) {
      $scope.ui.channelsIconsTriggers[i][j] = false
    }
  }
  console.log($scope.ui.channelsIconsTriggers)
})
