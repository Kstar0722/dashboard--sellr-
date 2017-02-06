/* globals angular */
angular.module('users').controller('newProductController', function ($scope, productEditorService, orderDataService, $state, toastr) {
  $scope.pes = productEditorService
  $scope.saveProduct = function () {
    orderDataService.createNewProduct(productEditorService.newProduct).then(function (response) {
      return productEditorService.setCurrentProduct(response.data)
    }).catch(function (response) {
      console.error(response.data)
      toastr.error('Failed to create new product')
      throw response
    }).then(function (product) {
      toastr.success('Created new product', 'Success!')
      $state.go('editor.match.view', { productId: product.productId })
    })
  }
})
