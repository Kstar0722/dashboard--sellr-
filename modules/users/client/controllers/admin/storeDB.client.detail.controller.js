/* globals angular */
angular.module('users.admin').controller('StoreDbDetailController', function ($scope, $location, $mdDialog, $mdMedia, locationsService,
                                                                              orderDataService, $state, accountsService, CurrentUserService,
                                                                              productEditorService, Authentication, $stateParams, constants, toastr, $q) {
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
    var upc = orderDataService.currentItem.upc
    var type = orderDataService.currentItem.productTypeId
    if (name) {
      productEditorService.getProductList(null, {
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

  $scope.searchDatabase = function () {
    productEditorService.clearProductList()
    onProductLoad()
  }

  $scope.increaseIndex = function () {
    $state.go('editor.match', $stateParams, { reload: true })
    productEditorService.clearProductList()
    orderDataService.increaseIndex()
  }

  $scope.decreaseIndex = function () {
    $state.go('editor.match', $stateParams, { reload: true })
    productEditorService.clearProductList()
    orderDataService.decreaseIndex()
  }

  $scope.markAsNew = function (prod) {
    orderDataService.createNewProduct(prod).then(function (data) {
      toastr.success('New Product Created')
      $scope.displayIndex += 1
    })
  }

  $scope.showConfirm = function (ev) {
    var defer = $q.defer()
    // Appending dialog to document.body to cover sidenav in docs app
    var confirm = $mdDialog.confirm()
      .title('Mark this product as new?')
      .textContent('This will set the product status for this product.')
      .targetEvent(ev)
      .ok('Mark as New')
      .cancel('Mark as Done')
    $mdDialog.show(confirm).then(function () {
      $scope.status = 'You decided to get rid of your debt.'
      defer.resolve('new')
    }, function () {
      $scope.status = 'You decided to keep your debt.'
      defer.resolve('done')
    })
    return defer.promise
  }

  $scope.matchProduct = function (ev) {
    $scope.showConfirm(ev).then(function (status) {
      orderDataService.matchProduct().then(function (selected) {
        productEditorService.getProduct(selected).then(function (product) {
          product.status = status
          productEditorService.save(product)
          toastr.success('Product Matched')
          $scope.increaseIndex()
        })
      })
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
      })
    }
  }
})

