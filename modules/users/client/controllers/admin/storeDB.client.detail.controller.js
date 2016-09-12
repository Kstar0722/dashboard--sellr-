/* globals angular */
angular.module('users.admin').controller('StoreDbDetailController', function ($scope, $location, $mdDialog, $mdMedia, locationsService,
                                                                              orderDataService, $state, accountsService, CurrentUserService,
                                                                              productEditorService, Authentication, $stateParams, constants, toastr, $q,$rootScope, cfpLoadingBar) {
  if (Authentication.user) {
    $scope.account = { createdBy: Authentication.user.username }
  }

  console.log('stateParams %O', $stateParams, orderDataService.allItems.length === 0);
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
    $rootScope.$broadcast('searchdb')
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
    if (orderDataService.selected[ 0 ].status === 'approved') {
      defer.resolve('approved')
    } else {
      var confirm = $mdDialog.confirm()
        .title('Mark this product as new?')
        .textContent('This will set the product status for this product.')
        .targetEvent(ev)
        .ok('Mark as New')
        .cancel('Mark as Done')
      $mdDialog.show(confirm).then(function () {
        defer.resolve('new')
      }, function () {
        defer.resolve('done')
      })
    }
    return defer.promise
  }

  $scope.matchProduct = function (ev) {
    $scope.showConfirm(ev).then(function (status) {
      cfpLoadingBar.start();
      orderDataService.matchProduct().then(function (selected) {
        return productEditorService.getProduct(selected);
      }).then(function (product) {
        product.status = status;
        return productEditorService.save(product);
      }).then(function () {
        toastr.success('Product Matched')
        $scope.increaseIndex()
      }).finally(function () {
        cfpLoadingBar.complete();
      })
    })
  };

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
      orderDataService.getData($stateParams.id, $stateParams.status).then(function () {
      })
    }
  }
})

