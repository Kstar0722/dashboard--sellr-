angular.module('core').controller('StoreOwnerListedProductsController', function ($scope, $stateParams, $state, $mdDialog, productsService, Types, $sce, toastr) {
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

  $scope.saveProduct = function () {
    productsService.updatePlanProduct($scope.ui.activeProduct).then(function () {
      getProducts()
      $scope.ui.activeIndex = null
      $scope.ui.display = 'fulltable'
    }).catch(catchHandler)
  }

  // $scope.saveProduct = function () {
  //   $scope.ui.priceErrors = []
  //   if (checkInvalidPricesSetup()) return false
  //   var oldPlan = retrieveOldPlanIfChanged()
  //   var plan = _.find($scope.plans, {planId: $scope.product.planId})
  //   var occupiedSlots
  //   if (oldPlan) {
  //     occupiedSlots = _.chain(plan.products).map('slot').compact().value()
  //   } else {
  //     occupiedSlots = _.chain(plan.products).map('slot').pull($scope.ui.originalSlot).compact().value()
  //   }
  //   if (_.includes(occupiedSlots, $scope.product.slot)) {
  //     var occupantProduct = _.find(plan.products, { slot: $scope.product.slot })
  //     $ionicPopup.confirm({
  //       title: 'Slot Occupied',
  //       cssClass: 'delete-product',
  //       cancelType: 'button-assertive',
  //       okText: 'Replace',
  //       okType: 'button-balanced',
  //       template: 'Are you sure you want to replace the slot <strong>' + $scope.product.slot + '</strong> occupied by ' + occupantProduct.name + '?'
  //     }).then(function (confirmed) {
  //       if (!confirmed) return
  //       $scope.ui.originalSlot = $scope.product.slot
  //       $scope.ui.originalPlanId = $scope.product.planId
  //       occupantProduct.slot = undefined
  //       $ionicLoading.show({ hideOnStateChange: true })
  //       if (oldPlan) {
  //         productService.removePlanProduct(oldPlan, $scope.product).then(function () {
  //           productService.updatePlanProduct(plan, occupantProduct).then(function () {
  //             productService.addPlanProduct(plan, $scope.product).then(function () {
  //               updateCurrentPlan()
  //             })
  //           })
  //         }).catch(catchHandler)
  //       } else {
  //         productService.updatePlanProduct(plan, occupantProduct).then(function () {
  //           productService.updatePlanProduct(plan, $scope.product).then(function () {
  //             updateCurrentPlan()
  //           })
  //         }).catch(catchHandler)
  //       }
  //     })
  //   } else {
  //     $ionicLoading.show({ hideOnStateChange: true })
  //     if (oldPlan) {
  //       productService.removePlanProduct(oldPlan, $scope.product).then(function () {
  //         productService.addPlanProduct(plan, $scope.product).then(function () {
  //           updateCurrentPlan()
  //         })
  //       }).catch(catchHandler)
  //     } else {
  //       productService.updatePlanProduct(plan, $scope.product).then(function () {
  //         updateCurrentPlan()
  //       }).catch(catchHandler)
  //     }
  //   }
  // }

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
  function getProducts () {
    var accountId = localStorage.getItem('accountId')
    productsService.getPlanProducts(accountId).then(function (plans) {
      $scope.plans = plans
      var allProductsPlan = {
        label: 'All Products',
        products: $scope.plans.reduce(function (all, plan, i) {
          return all.concat(plan.products)
        }, [])
      }
      $scope.plans.unshift(allProductsPlan)
      $scope.selectPlan(allProductsPlan)
    })
  }

  function catchHandler (err) {
    console.error(err)
    toastr.error('Failed to update product')
  }
})
