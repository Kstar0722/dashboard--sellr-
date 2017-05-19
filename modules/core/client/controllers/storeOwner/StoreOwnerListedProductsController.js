angular.module('core').controller('StoreOwnerListedProductsController', function ($scope, $stateParams, $state, $mdDialog, productsService, Types, $sce, toastr, $q) {
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.activeProduct = {}
  $scope.plans = []
  $scope.selectedPlan = {products: []}
  $scope.Types = Types
  $scope.slotSelectOptions = productsService.buildSlots()
  $scope.slotSelectConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'slot',
    labelField: 'slot',
    sortField: 'slot',
    searchField: [ 'slot' ]
  }
  $scope.sizesSelectConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    placeholder: 'Select a size',
    valueField: 'size',
    labelField: 'size',
    sortField: 'size',
    searchField: [ 'size' ]
  }
  $scope.planSelectConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'planId',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }
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

  //
  // SCOPE FUNCTIONS
  //
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

  $scope.selectPlan = function (plan) {
    $scope.selectedPlan = plan
  }

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
    var planId = parseInt($scope.ui.activeProduct.planId)
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

  $scope.openEditProduct = function (product, index) {
    $scope.ui.showCustomSize = []
    $scope.ui.priceErrors = []
    $scope.ui.originalSlot = product.slot
    $scope.ui.originalPlanId = product.planId
    var sizes = angular.copy(Types[product.productTypeId].sizes)
    sizes.push('Custom')
    $scope.sizesSelectOptions = _.map(sizes, function (s) { return {size: s} })
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
    $scope.ui.activeIndex = index
    $scope.ui.display = 'editProduct'
    console.log($scope.ui.activeProduct)
  }

  //
  // INITIALIZATON
  //
  getProducts()

  //
  // PRIVATE FUNCTIONS
  //
  function afterDeletion (index) {
    $scope.ui.activeProduct.prices.splice(index, 1)
    $scope.ui.showCustomSize.splice(index, 1)
  }

  function handleSuccess () {
    getProducts().then(function () {
      $scope.ui.activeIndex = null
      $scope.ui.display = 'fulltable'
    })
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

  function getProducts () {
    var defer = $q.defer()
    var accountId = localStorage.getItem('accountId')
    productsService.getPlanProducts(accountId).then(function (plans) {
      $scope.planSelectOptions = _.map(plans, function (p) { return {name: p.label, planId: p.planId} })
      $scope.plans = plans
      var allProductsPlan = {
        label: 'All Products',
        products: $scope.plans.reduce(function (all, plan, i) {
          return all.concat(plan.products)
        }, [])
      }
      $scope.plans.unshift(allProductsPlan)
      $scope.selectPlan(allProductsPlan)
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
})
