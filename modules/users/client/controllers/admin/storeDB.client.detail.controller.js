/* globals angular */
angular.module('users.admin').controller('StoreDbDetailController', function ($scope, $location, $mdDialog, $mdMedia, locationsService,
                                                                              orderDataService, $state, accountsService, CurrentUserService,
                                                                              productEditorService, Authentication, $stateParams, constants, uploadService, toastr) {
  if (Authentication.user) {
    $scope.account = { createdBy: Authentication.user.username }
  }
  console.log('stateParams %O', orderDataService.allItems.length === 0)
  onInit()
  $scope.orderDataService = orderDataService
  $scope.orders = {}
  $scope.displayIndex = 0
  function onProductLoad () {
    productEditorService.productList = []
    var name = orderDataService.currentItem.name
    var sku = orderDataService.currentItem.upc
    if (name) {
      productEditorService.getProductList(name, {}).then(function (productList) {
        productEditorService.searchSkuResults(sku, productList)
      })
    } else {
      productEditorService.searchSkuResults(sku)
    }
  }

  $scope.searchDatabase = function () {
    productEditorService.productList = []
    onProductLoad()
  }

  $scope.increaseIndex = function () {
    productEditorService.productList = []
    orderDataService.increaseIndex()
    if (orderDataService.currentItem.productId === '0') {
      onProductLoad()
    }
  }

  $scope.markAsNew = function (prod) {
    orderDataService.createNewProduct(prod).then(function (data) {
      toastr.success('New Product Created')
      $scope.displayIndex += 1
    })
  }
  $scope.matchProduct = function () {
    orderDataService.matchProduct().then(function (data) {
      var message = data.message || ''
      toastr.success(message, 'Product Matched')
      $scope.increaseIndex()
    })
  }
  $scope.updateFilter = function (value) {
    $scope.checked = false
    for (var i in $scope.filter) {
      if ($scope.filter[ i ].type === value.type) {
        $scope.filter.splice(i, 1)
        $scope.checked = true
      }
    }
    if (!$scope.checked) {
      $scope.filter.push(value)
    }
    console.log($scope.filter)
  }

  function onInit () {
    if (orderDataService.allItems.length === 0 && $stateParams.id) {
      orderDataService.getData($stateParams.id).then(function () {
        onProductLoad()
      })
    }
  }
})

