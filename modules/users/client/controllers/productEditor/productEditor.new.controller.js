/* globals angular*/
angular.module('users').controller('newProductController', function ($scope, productEditorService, orderDataService) {
  $scope.pes = productEditorService
  $scope.save = orderDataService.createNewProduct(productEditorService.newProduct)
})
