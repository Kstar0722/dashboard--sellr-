angular.module('core').controller('EditorProductsMatchController', function ($scope, Authentication, $q, $http, productEditorService, $location, $state, $stateParams, Countries, orderDataService, $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, $timeout, ProductTypes, cfpLoadingBar, $analytics, $mdDialog, $sce, globalClickEventName, toastr, storesService) {
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

  function setStoreUI () {
    if ($stateParams.storeId) {
      var storeId = parseInt($stateParams.storeId, 10)
      $scope.storeUI = _.find(orderDataService.allStores, {storeId: storeId})
    } else {
      $scope.storeUI = {}
    }
  }

  $scope.orderDataService = orderDataService
  $scope.statusLabel = $stateParams.status || ''

  $scope.closePanel = function () {
    if ($state.params.productId) {
      if ($state.current.name.indexOf('matchview') > -1) {
        $state.go('editor.products.view', { productId: $state.params.productId })
      } else {
        $state.go('editor.products.edit', { productId: $state.params.productId })
      }
    } else {
      $state.go('editor.products')
    }
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

  $scope.increaseIndex = function () {
    // $state.go('editor.old.match', $stateParams, { reload: true })
    productEditorService.clearProductList()
    orderDataService.increaseIndex()
  }

  $scope.decreaseIndex = function () {
    // $state.go('editor.old.match', $stateParams, { reload: true })
    productEditorService.clearProductList()
    orderDataService.decreaseIndex()
  }

  $scope.deleteCurrentProduct = function () {
    orderDataService.deleteCurrentItem().then(function () {
      toastr.success('Product Deleted')
    }, function () {
      toastr.error('Somethign went wrong while trying to delete the Product')
    })
  }
})
