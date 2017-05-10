angular.module('core').controller('EditorProductsMatchController', function ($scope, $state, $stateParams, orderDataService, productEditorService, toastr) {
  //
  // DEFINITIONS
  //
  $scope.orderDataService = orderDataService
  $scope.statusLabel = $stateParams.status || ''

  //
  // INITIALIZATION
  //
  if (orderDataService.allItems.length === 0 && $stateParams.storeId) {
    orderDataService.getData({ storeId: $stateParams.storeId }, $stateParams.status).then(function () {})
  }
  if (orderDataService.allStores.length === 0) {
    orderDataService.getAllStores().then(function () {
      setStoreUI()
    })
  } else {
    setStoreUI()
  }

  //
  // SCOPE FUNCTIONS
  //
  $scope.closePanel = function () {
    $state.go('editor.storeManagement')
    // if ($state.params.productId) {
    //   if ($state.current.name.indexOf('matchview') > -1) {
    //     $state.go('editor.products.view', { productId: $state.params.productId })
    //   } else {
    //     $state.go('editor.products.edit', { productId: $state.params.productId })
    //   }
    // } else {
    //   $state.go('editor.products')
    // }
  }

  $scope.findSimilarProducts = function () {
    productEditorService.clearProductList()
    var name = orderDataService.currentItem.name
    var upc = orderDataService.currentItem.upc
    var type = orderDataService.currentItem.productTypeId
    if (name) {
      productEditorService.getProductList(null, {
        filter: {},
        sum: true,
        name: name,
        types: [ { type: type } ]
      }).then(function (productList) {
        productEditorService.searchSkuResults({ upc: upc, productList: productList, type: type })
      })
    } else {
      productEditorService.searchSkuResults({ upc: upc, type: type })
    }
  }

  $scope.viewMatchProduct = function (productId, status) {
    if (!productId) {
      toastr.error('Could not get details for product, no productId.')
      return
    }
    $state.go('editor.products.matchview', { storeId: $state.params.storeId, productId: productId, status: status })
  }

  $scope.deleteCurrentProduct = function () {
    orderDataService.deleteCurrentItem().then(function () {
      toastr.success('Product Deleted')
    }, function () {
      toastr.error('Somethign went wrong while trying to delete the Product')
    })
  }

  //
  // INTERNAL FUNCTIONS
  //
  function setStoreUI () {
    if ($stateParams.storeId) {
      var storeId = parseInt($stateParams.storeId, 10)
      $scope.storeUI = _.find(orderDataService.allStores, {storeId: storeId})
    } else {
      $scope.storeUI = {}
    }
  }
})
