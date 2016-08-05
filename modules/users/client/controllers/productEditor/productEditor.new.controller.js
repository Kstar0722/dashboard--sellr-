/* globals angular*/
angular.module('users').controller('newProductController', function ($scope, productEditorService, orderDataService) {
  $scope.pes = productEditorService
  $scope.saveProduct = function () {
    orderDataService.createNewProduct(productEditorService.newProduct)
  }
})
