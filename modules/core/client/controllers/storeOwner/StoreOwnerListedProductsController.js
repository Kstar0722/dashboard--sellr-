angular.module('core').controller('StoreOwnerListedProductsController', function ($scope, $stateParams, $state, $mdDialog, productsService, Types, $sce, toastr, $q, storesService, $timeout, utilsService, $filter, $rootScope, uploadService) {
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.activeProduct = {}
  $scope.ui.planFilter = 'All Products'
  $scope.mobile = {}
  $scope.mobile.viewTitle = 'Listed Products'
  $scope.mobile.view = 'plan-list'
  $scope.mobile.backViewStack = []
  $scope.plans = []
  $scope.filteredPlan = {products: []}
  $scope.Types = Types
  $scope.slotSelectOptions = productsService.buildSlots()
  var confirmationDialogOptions = {
    templateUrl: '/modules/core/client/views/popupDialogs/confirmationDialog.html',
    autoWrap: true,
    parent: angular.element(document.body),
    scope: $scope,
    preserveScope: true,
    hasBackdrop: true,
    clickOutsideToClose: true,
    escapeToClose: true,
    fullscreen: true
  }
// function that accepts two arguments: "input" and "callback". The callback should be invoked with the final data for the option.
  var commonSelectizeConfig = { create: false, maxItems: 1, allowEmptyOption: false }
  $scope.slotSelectConfig = _.extend({}, commonSelectizeConfig, {valueField: 'slot', labelField: 'slot', sortField: 'slot', searchField: [ 'slot' ]})

  $scope.sizesSelectConfig = _.extend({}, commonSelectizeConfig, {placeholder: 'Select a size', valueField: 'size', labelField: 'size', sortField: 'size', searchField: [ 'size' ]})
  // $scope.storesFilterSelectConfig = _.extend({}, commonSelectizeConfig, {valueField: 'storeId', labelField: 'name', sortField: 'name', searchField: [ 'name' ]})
  $scope.planFilterSelectConfig = _.extend({}, commonSelectizeConfig, {valueField: 'label', labelField: 'label', sortField: 'label', searchField: [ 'label' ]})
  $scope.planSelectConfig = _.extend({}, commonSelectizeConfig,
    {
      createOnBlur: false,
      valueField: 'planId',
      labelField: 'name',
      sortField: 'name',
      searchField: [ 'name' ],
      create: onPlanCreate
    })
  $scope.productTypeConfig = _.extend({}, commonSelectizeConfig, {valueField: 'productTypeId', labelField: 'name', sortField: 'name', searchField: [ 'name' ]})
  $scope.productTypeOptions = _.values(Types)

  //
  // SCOPE FUNCTIONS
  //
  $scope.changeTypeHandler = function () {
    setSizesSelectOptions($scope.ui.activeProduct.productTypeId)
  }

  $scope.toggleSelectAllProducts = function (forcedValue) {
    var flag = forcedValue || $scope.ui.allProductsSelected
    $scope.ui.selectedProducts = []
    _.each($scope.filteredPlan.products, function (p) {
      if (flag) {
        $scope.ui.selectedProducts.push(formatProductForExport(p))
      }
      p.selected = flag
    })
    $scope.ui.showProductsSelectedActions = $scope.ui.selectedProducts.length > 0
  }

  $scope.toggleSelectProduct = function (product) {
    $scope.ui.selectedProducts = $scope.ui.selectedProducts || []
    var i = _.findIndex($scope.ui.selectedProducts, function (selectedProduct) {
      return selectedProduct.productId === product.productId
    })
    if (i < 0) {
      $scope.ui.selectedProducts.push(formatProductForExport(product))
    } else {
      $scope.ui.selectedProducts.splice(i, 1)
    }
    $scope.ui.showProductsSelectedActions = $scope.ui.selectedProducts.length > 0
  }

  $scope.reOrderList = function (field) {
    var oldSort = $scope.ui.sortExpression || ''
    var asc = true
    if (oldSort.substr(1) === field) asc = oldSort[0] === '-'
    $scope.ui.sortExpression = (asc ? '+' : '-') + field
    return $scope.ui.sortExpression
  }

  $scope.showUploadCsvDialog = function (ev) {
    $mdDialog.show({
      templateUrl: '/modules/core/client/views/popupDialogs/uploadCsvDialog.html',
      autoWrap: true,
      parent: angular.element(document.body),
      preserveScope: false,
      hasBackdrop: true,
      clickOutsideToClose: false,
      escapeToClose: false,
      fullscreen: true,
      controller: 'CsvImporterController'
    })
  }

  $scope.showAddProductDialog = function (ev) {
    $mdDialog.show({
      templateUrl: '/modules/core/client/views/popupDialogs/addProductDialog.html',
      autoWrap: true,
      parent: angular.element(document.body),
      preserveScope: false,
      hasBackdrop: true,
      clickOutsideToClose: false,
      escapeToClose: false,
      fullscreen: true,
      controller: 'AddProductController'
    })
  }
  // $scope.showAddProductDialog()

  $scope.showPromoteProductDialog = function (ev) {
    $scope.genericDialog = {}
    $scope.genericDialog.title = 'Promote Product'
    $scope.genericDialog.body = 'The Product will be promoted'
    $scope.genericDialog.actionText = 'Confirm'
    $scope.genericDialog.actionClass = 'common-btn-positive'
    $scope.genericDialog.action = function () {
      $scope.ui.promotedProduct = true
      $scope.closeDialog()
    }
    $mdDialog.show(confirmationDialogOptions)
  }

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  $scope.filterPlan = function () {
    $scope.filteredPlan = _.findWhere($scope.plans, {label: $scope.ui.planFilter})
  }

  $scope.filterPlanMobile = function (plan) {
    $scope.filteredPlan = _.findWhere($scope.plans, {label: plan.label})
    utilsService.setViewMobile($scope, 'product-grid', 'plan-list', plan.label, 'Listed Products')
  }

  $scope.goToProductDetailMobile = function (product, productIndex) {
    $scope.openEditProduct(product, productIndex)
    $scope.mobile.rightBtn = {
      icon: 'fa fa-check',
      action: $scope.saveProduct
    }
    utilsService.setViewMobile($scope, 'product-detail', 'product-grid', 'Edit Product', $scope.filteredPlan.label)
  }

  $scope.handleBackMobile = utilsService.handleBackMobile.bind(null, $scope)

  $scope.resetSize = function (index) {
    $scope.ui.activeProduct.prices[index].size = ''
    $scope.ui.showCustomSize[index] = false
  }

  $scope.selectSizeHandler = function (index) {
    if ($scope.ui.activeProduct.prices[index].size === 'Custom') {
      $scope.ui.showCustomSize[index] = true
      $scope.ui.activeProduct.prices[index].size = ''
    }
  }

  $scope.changePlanHandler = function () {
    var planId = parseInt($scope.ui.activeProduct.planId, 10)
    $scope.ui.activeProduct.planId = planId
    _.each($scope.ui.activeProduct.prices, function (p) {
      p.planId = planId
      p.changed = 'new'
    })
    _.each($scope.ui.activeProduct.properties, function (p) {
      if (p.planId) {
        p.planId = planId
        p.changed = 'new'
      }
    })
  }

  $scope.uploadProductImage = function (files) {
    if (_.isEmpty(files)) {
      return
    }
    $scope.ui.activeProduct.tempImage = files[0]
  }

  $scope.removeProductImage = function () {
    $scope.ui.activeProduct.tempImage = null
  }

  $scope.addProduct = function (formValid) {
    $scope.ui.priceErrors = []
    if (!formValid | checkInvalidPricesSetup()) {
      utilsService.setFieldsTouched($scope.productForm.$error)
      return false
    }
    $scope.ui.activeProduct.defaultPriceLabel = $scope.ui.activeProduct.prices[0].size

    var mediaConfig = {
      mediaRoute: 'media',
      folder: 'images',
      type: 'RESEARCH_IMG',
      fileType: 'RESEARCH_IMG',
      accountId: utilsService.currentAccountId
    }
    uploadService.upload($scope.ui.activeProduct.tempImage, mediaConfig).then(function (res) {
      $scope.ui.activeProduct.researchImage = res.publicUrl
      $scope.ui.activeProduct.mediaAssets = [res.mediaAssetId]
      var hmcProduct = mapNotFoundProduct($scope.ui.activeProduct)
      productsService.addNotFound(hmcProduct).then(function () {
        toastr.success('The product was submitted successfully')
        handleSuccess()
      })
    }, function (err) {
      console.error('upload error %O', err)
    })
  }

  $scope.saveProduct = function () {
    $scope.ui.priceErrors = []
    if (checkInvalidPricesSetup()) return false
    $scope.ui.activeProduct.defaultPriceLabel = $scope.ui.activeProduct.prices[0].size
    var oldPlan = retrieveOldPlanIfChanged()
    var plan = _.find($scope.plans, { planId: $scope.ui.activeProduct.planId })
    var occupiedSlots
    if (oldPlan) {
      occupiedSlots = _.chain(plan.products).map('slot').compact().value()
    } else {
      occupiedSlots = _.chain(plan.products).map('slot').without($scope.ui.originalSlot).compact().value()
    }
    if (_.includes(occupiedSlots, $scope.ui.activeProduct.slot)) {
      var occupantProduct = _.find(plan.products, { slot: $scope.ui.activeProduct.slot })
      $scope.genericDialog = {}
      $scope.genericDialog.title = 'Slot Ocuppied'
      $scope.genericDialog.body = 'Are you sure you want to replace the slot ' + $scope.ui.activeProduct.slot + ' occupied by ' + occupantProduct.name + '?'
      $scope.genericDialog.actionText = 'Replace Slot'
      $scope.genericDialog.actionClass = 'common-btn-positive'
      $scope.genericDialog.action = function () {
        $mdDialog.hide()
        $scope.ui.originalSlot = $scope.ui.activeProduct.slot
        $scope.ui.originalPlanId = $scope.ui.activeProduct.planId
        occupantProduct.slot = undefined
        if (oldPlan) {
          productsService.removePlanProduct(oldPlan, $scope.ui.activeProduct).then(function () {
            productsService.updatePlanProduct(occupantProduct).then(function () {
              productsService.addPlanProduct(plan, $scope.ui.activeProduct).then(function () {
                handleSuccess()
              })
            })
          }).catch(catchHandler)
        } else {
          productsService.updatePlanProduct(occupantProduct).then(function () {
            productsService.updatePlanProduct($scope.ui.activeProduct).then(function () {
              handleSuccess()
            })
          }).catch(catchHandler)
        }
      }
      $mdDialog.show(confirmationDialogOptions)
    } else {
      if (oldPlan) {
        productsService.removePlanProduct(oldPlan, $scope.ui.activeProduct).then(function () {
          productsService.addPlanProduct(plan, $scope.ui.activeProduct).then(function () {
            handleSuccess()
          })
        }).catch(catchHandler)
      } else {
        productsService.updatePlanProduct($scope.ui.activeProduct).then(function () {
          handleSuccess()
        }).catch(catchHandler)
      }
    }
  }

  $scope.deleteSizeOption = function (index) {
    if ($scope.ui.activeProduct.prices[ index ].priceId) {
      productsService.deletePriceOption($scope.ui.activeProduct.prices[ index ].priceId).then(function () {
        afterDeletion(index)
      })
    } else {
      afterDeletion(index)
    }
  }

  $scope.setDefault = function (index) {
    // Default Price label will be set on save
    // We are displacing items unshifting one after the other
    $scope.ui.activeProduct.prices.unshift($scope.ui.activeProduct.prices.splice(index, 1)[ 0 ])
    // Therefore we need to accomodate all the Show Custom label again
    var sizes = angular.copy(Types[$scope.ui.activeProduct.productTypeId].sizes)
    _.each($scope.ui.activeProduct.prices, function (price, index) {
      if (!_.includes(sizes, $scope.ui.activeProduct.prices[ index ].size)) {
        $scope.ui.showCustomSize[ index ] = true
      } else {
        $scope.ui.showCustomSize[ index ] = false
      }
    })
  }

  $scope.addSizeOption = function () {
    $scope.ui.activeProduct.prices.push({
      size: '',
      price: '',
      onsale: false,
      oprice: '',
      changed: 'new'
    })
    $scope.ui.showCustomSize.push(false)
  }

  $scope.onSaleHandler = function (index) {
    if ($scope.ui.priceErrors[index]) $scope.ui.priceErrors[index] = {}
    if ($scope.ui.activeProduct.prices[index].onsale) {
      $scope.ui.activeProduct.prices[index].oprice = $scope.ui.activeProduct.prices[index].price
      $scope.ui.activeProduct.prices[index].price = ''
    } else {
      $scope.ui.activeProduct.prices[index].price = $scope.ui.activeProduct.prices[index].oprice
      $scope.ui.activeProduct.prices[index].oprice = ''
    }
  }

  $scope.openAddPoductSidebar = function () {
    $scope.ui.showCustomSize = []
    $scope.ui.priceErrors = []
    $scope.ui.display = 'addProduct'
    $scope.ui.activeProduct = {}
    $scope.ui.activeProduct.prices = []
    $scope.addSizeOption()
    setSizesSelectOptions(null)
  }

  $scope.openEditProduct = function (product, productIndex) {
    $scope.ui.showCustomSize = []
    $scope.ui.priceErrors = []
    $scope.ui.originalSlot = product.slot
    $scope.ui.originalPlanId = product.planId
    var sizes = setSizesSelectOptions(product.productTypeId)
    _.each(product.prices, function (sizeOption, index) {
      product.prices[index].changed = 'update'
      // ng-model doesnt like number 1 so must explicily set to true or false
      product.prices[index].onsale ? product.prices[index].onsale = true : product.prices[index].onsale = false
      if (sizeOption.size && !_.includes(sizes, sizeOption.size)) {
        $scope.ui.showCustomSize[index] = true
      }
    })
    if (_.isEmpty(product.prices)) {
      product.prices = []
      product.prices[0] = {
        price: product.price,
        size: '',
        oprice: product.oprice,
        onsale: product.onsale,
        changed: 'new'
      }
      $scope.ui.showCustomSize[0] = false
    }
    $scope.ui.descriptionHTML = $sce.trustAsHtml(product.description)
    $scope.ui.activeProduct = angular.copy(product)
    $scope.ui.activeIndex = productIndex
    $scope.ui.display = 'editProduct'
    console.log($scope.ui.activeProduct)
  }

  $scope.downloadCsv = function (selected) {
    return selected.map(function (product) {
      product.description = window.htmlText.fromString(product.description)
      return product
    })
  }

  //
  // INITIALIZATON
  //
  init()

  //
  // PRIVATE FUNCTIONS
  //
  function init () {
    getStoreProducts()
  }

  function setSizesSelectOptions (productTypeId) {
    var sizes = []
    if (!_.isNull(productTypeId)) {
      sizes = angular.copy(Types[productTypeId].sizes)
    }
    sizes.push('Custom')
    $scope.sizesSelectOptions = _.map(sizes, function (s) { return {size: s} })
    return sizes
  }

  function afterDeletion (index) {
    $scope.ui.activeProduct.prices.splice(index, 1)
    $scope.ui.showCustomSize.splice(index, 1)
  }

  function onPlanCreate (input, callback) {
    var newCategory = {
      accountId: utilsService.currentAccountId,
      storeId: utilsService.currentStoreId,
      label: input
    }
    productsService.createCategory(newCategory).then(function (newPlan) {
      getStoreProducts().then(function () {
        callback({name: newPlan.label, planId: newPlan.planId + ''})
      })
    })
  }

  function handleSuccess () {
    getStoreProducts().then(function () {
      $scope.ui.activeIndex = null
      $scope.ui.selectedProducts = []
      $scope.ui.showProductsSelectedActions = false
      $scope.ui.display = 'fulltable'
      utilsService.handleBackMobile($scope)
    })
  }

  function formatProductForExport (p) {
    var price = p.prices[0] ? p.prices[0].price : ''
    var sku = p.skus[0] || ''
    return {
      title: p.name,
      productId: p.productId,
      description: p.description,
      price: price,
      upc: sku
    }
  }

  function checkInvalidPricesSetup () {
    var flag = false
    _.each($scope.ui.activeProduct.prices, function (sizeOption, index) {
      $scope.ui.priceErrors[ index ] = {}
      if (!sizeOption.price) {
        $scope.ui.priceErrors[ index ].price = true
        flag = true
      }
      if (!sizeOption.size) {
        $scope.ui.priceErrors[ index ].size = true
        flag = true
      }
      if (sizeOption.onsale && !sizeOption.oprice) {
        $scope.ui.priceErrors[ index ].oprice = true
        flag = true
      }
    })
    if (flag) {
      toastr.error('Please complete the Size option fields')
      return true
    }
    return false
  }

  function getStoreProducts () {
    var defer = $q.defer()
    productsService.getPlanProducts(utilsService.currentStoreId).then(function (plans) {
      $scope.planSelectOptions = _.map(plans, function (p) { return {name: p.label, planId: p.planId} })
      var allProducts = {
        label: 'All Products',
        products: plans.reduce(function (memo, plan, i) {
          return memo.concat(plan.products)
        }, [])
      }
      plans.unshift(allProducts)
      var pendingProducts = {
        label: 'Pending Products',
        products: plans.reduce(function (memo, plan, i) {
          return memo.concat($filter('filterPending')(plan.products))
        }, [])
      }
      plans.push(pendingProducts)
      _.each(plans, function (p) {
        if (p.label !== 'Pending Products') {
          p.products = $filter('filterApproved')(p.products)
        }
      })
      $scope.plans = plans
      $scope.filterPlan()
      utilsService.scrollTop()
      defer.resolve()
    })
    return defer.promise
  }

  function retrieveOldPlanIfChanged () {
    var originalPlan = _.find($scope.plans, { planId: $scope.ui.originalPlanId })
    var newPlan = _.find($scope.plans, { planId: $scope.ui.activeProduct.planId })
    if (originalPlan.planId === newPlan.planId) {
      return false
    }
    return originalPlan
  }

  function catchHandler (err) {
    console.error(err)
    toastr.error('Failed to update product')
  }

  function mapNotFoundProduct (uiProd) {
    return {
      accountId: utilsService.currentAccountId,
      storeId: utilsService.currentStoreId,
      planId: utilsService.convertToInt(uiProd.planId),
      skus: [uiProd.sku],
      researchImage: uiProd.researchImage,
      source: 'Dashboard',
      prices: uiProd.prices,
      mediaAssets: uiProd.mediaAssets,
      productTypeId: uiProd.productTypeId,
      defaultPriceLabel: uiProd.defaultPriceLabel
    }
  }

  var deregisterStoreIdListener = $rootScope.$on('currentStoreIdChanged', init)
  // To avoid Leaks
  $scope.$on('$destroy', function () {
    deregisterStoreIdListener()
  })
})
