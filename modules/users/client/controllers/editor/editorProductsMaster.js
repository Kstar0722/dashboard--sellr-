angular.module('core').controller('EditorProductsMasterController', function ($scope, Authentication, $q, $http, productEditorService, $location, $state, $stateParams, Countries, orderDataService, $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, $timeout, ProductTypes, cfpLoadingBar, $analytics, $mdDialog, $sce, globalClickEventName) {
  //
  // DEFINITIONS
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.searchText = ''
  $scope.selectedProducts = []
  $scope.ui.allProductsSelected = false
  $scope.selectStoreFilterConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'storeId',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }
  $scope.pes = productEditorService
  $scope.newProductsLabel = 'New Products Available'
  $scope.newProductLimit = 0
  var localStorage = window.localStorage
  var userId = localStorage.getItem('userId')
  $scope.searchOptions = {}
  $scope.searchOptions.orderBy = '+name'
  $scope.searchOptions.searchLimit = 50
  $scope.searchOptions.searchInAll = true
  $scope.searchOptions.searchInName = true
  $scope.searchOptions.nomore = true
  $scope.searchOptions.searchInDescription = true
  $scope.searchOptions.searchInProductId = true
  $scope.searchOptions.searchInSKU = true
  $scope.searchOptions.searchInNotes = true
  $scope.searchOptions.userId = userId
  $scope.searchOptions.storeId = ''
  $scope.searchOptions.allStores = []
  $scope.searchOptions.statusRadio = ''
  $scope.searchOptions.wineTypeCheck = true
  $scope.searchOptions.beerTypeCheck = true
  $scope.searchOptions.spiritTypeCheck = true

  $scope.permissions = {
    editor: Authentication.user.roles.indexOf(1010) > -1 || Authentication.user.roles.indexOf(1004) > -1,
    curator: Authentication.user.roles.indexOf(1011) > -1 || Authentication.user.roles.indexOf(1004) > -1
  }

  $scope.mediumEditorOptions = {
    imageDragging: false,
    extensions: {
      's3-image-uploader': new MediumS3ImageUploader()
    },
    toolbar: {
      buttons: ['bold', 'italic', 'underline', 'strikethrough']
    },
    placeholder: {
      text: '',
      hideOnClick: true
    }
  }

  //
  // INITIALIZATION
  //
  if (localStorage.getItem('filterByUserId')) {
    $scope.searchOptions.filterByUserId = true
  } else {
    $scope.searchOptions.filterByUserId = false
  }

  if (orderDataService.allStores.length === 0) {
    orderDataService.getAllStores().then(fillStoresOptions)
  } else {
    fillStoresOptions(orderDataService.allStores)
  }

  productEditorService.checkForNewProducts()

  //
  // SCOPE FUNCTIONS
  //
  $scope.searchProducts = function () {
    //  Reset new products logic
    $scope.newProductsLabel = 'New Products Available'
    $scope.newProductLimit = 0
    $scope.ui.searchOptionsMenu = false

    productEditorService.getProductList($scope.searchOptions.searchText, buildSearchOptions()).then(function (products) {})
  }

  $scope.mergeProducts = function () {
    cfpLoadingBar.start()
    mergeService.merge($scope.selectedProducts).then(function () {
      $state.go('editor.products.merge')
    }).finally(function () {
      cfpLoadingBar.complete()
    })
  }

  $scope.reOrderList = function (field) {
    switch (field) {
      case 'name':
        $scope.searchOptions.orderBy = $scope.searchOptions.orderBy.substr(0, 2) === '+n' ? '-name' : '+name'
        break
      case 'sku':
        $scope.searchOptions.orderBy = $scope.searchOptions.orderBy.substr(0, 4) === '+sku' ? '-sku_count' : '+sku_count'
        break
      case 'audio':
        $scope.searchOptions.orderBy = $scope.searchOptions.orderBy.substr(0, 2) === '+a' ? '-audio' : '+audio'
        break
      case 'image':
        $scope.searchOptions.orderBy = $scope.searchOptions.orderBy.substr(0, 2) === '+i' ? '-image' : '+image'
        break
      case 'status':
        $scope.searchOptions.orderBy = $scope.searchOptions.orderBy.substr(0, 4) === '+sta' ? '-status' : '+status'
        break
      case 'type':
        $scope.searchOptions.orderBy = $scope.searchOptions.orderBy.substr(0, 2) === '+p' ? '-productTypeId' : '+productTypeId'
        break
      default:
        $scope.searchOptions.orderBy = '+name'
        break
    }
    $scope.searchProducts()
  }

  $scope.toggleFilterByUserId = function () {
    if ($scope.searchOptions.filterByUserId) {
      localStorage.setItem('filterByUserId', 'true')
    } else {
      localStorage.removeItem('filterByUserId')
    }
  }

  $scope.toggleSearchInAll = function () {
    var value = !!$scope.searchOptions.searchInAll
    $scope.searchOptions.searchInName = value
    $scope.searchOptions.searchInDescription = value
    $scope.searchOptions.searchInProductId = value
    $scope.searchOptions.searchInSKU = value
    $scope.searchOptions.searchInNotes = value
  }

  $scope.loadNewProducts = function () {
    $scope.newProductsLabel = 'Load more new products'
    $scope.loadingData = true
    $scope.newProductLimit += 100
    // this is a hack to force angular to redraw the page
    $timeout(function () {
      productEditorService.viewNewProducts($scope.newProductLimit).then(function () {
        $scope.loadingData = false
      })
    }, 0)
  }

  $scope.openMenu = function (menu, index) {
    closeMenus()
    if (!_.isUndefined(index)) {
      $scope.ui[menu][index] = true
    } else {
      $scope.ui[menu] = true
    }
  }

  $scope.toggleSelectProduct = function (product) {
    $scope.selectedProducts = $scope.selectedProducts || []
    var i = _.findIndex($scope.selectedProducts, function (selectedProduct) {
      return selectedProduct.productId === product.productId
    })
    if (i < 0) {
      $scope.selectedProducts.push(product)
    } else {
      $scope.selectedProducts.splice(i, 1)
    }
    $scope.ui.showProductsSelectedActions = $scope.selectedProducts.length > 0
    if ($state.includes('editor.match')) {
      orderDataService.storeSelected($scope.selectedProducts)
    }
  }

  $scope.toggleSelectAllProducts = function (forcedValue) {
    var flag = forcedValue || $scope.ui.allProductsSelected
    $scope.selectedProducts = []
    _.forEach(productEditorService.productList, function (p) {
      if (flag) {
        $scope.selectedProducts.push(p)
      }
      p.selected = flag
    })
    $scope.ui.showProductsSelectedActions = $scope.selectedProducts.length > 0
    if ($state.includes('editor.match')) {
      orderDataService.storeSelected($scope.selectedProducts)
    }
  }

  $scope.viewProduct = function (product) {
    $state.go('editor.products.view', { productId: product.productId })
  }

  //
  // INTERNAL FUNCTIONS
  //
  function buildSearchOptions () {
    var inColumns = ''
    if ($scope.searchOptions.searchInName) inColumns += 'name+'
    if ($scope.searchOptions.searchInDescription) inColumns += 'description+'
    if ($scope.searchOptions.searchInProductId) inColumns += 'id+'
    if ($scope.searchOptions.searchInSKU) inColumns += 'sku+'
    if ($scope.searchOptions.searchInNotes) inColumns += 'notes'
    if (inColumns === '') {
      inColumns = 'name'
      $scope.searchOptions.searchInName = true
    }
    inColumns = encodeURIComponent(inColumns)
    var options = {
      status: $scope.searchOptions.statusRadio,
      types: buildTypeSearchOption(),
      filter: $scope.searchOptions,
      inColumns: inColumns,
      ignoreLoadingBar: false
    }
    if ($scope.searchOptions.storeId) {
      options.store = {storeId: $scope.searchOptions.storeId}
    }
    return options
  }

  function buildTypeSearchOption () {
    var typeFilter = []
    if ($scope.searchOptions.wineTypeCheck) typeFilter.push({'type': 1})
    if ($scope.searchOptions.beerTypeCheck) typeFilter.push({'type': 2})
    if ($scope.searchOptions.spiritTypeCheck) typeFilter.push({'type': 3})
    return typeFilter
  }

  function fillStoresOptions (stores) {
    $scope.searchOptions.allStores = angular.copy(stores)
    $scope.searchOptions.allStores.unshift({ storeId: '', name: '-- All Stores --' })
  }

  function closeMenus () {
    $scope.ui.searchOptionsMenu = false
  }

  //
  // EVENTS
  //
  // var unregisterGlobalClick = $rootScope.$on(globalClickEventName, function (event, targetElement) {
  //   if (targetElement.className.indexOf('ignore-click-trigger') === -1) {
  //     $scope.$apply(function () {
  //       closeMenus()
  //     })
  //   }
  // })

  // MANDATORY to prevent Leak
  // $scope.$on('$destroy', unregisterGlobalClick)
})
