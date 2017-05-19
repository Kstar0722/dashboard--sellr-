angular.module('core').controller('EditorProductsEditController', function ($scope, productEditorService, $state, $stateParams, Countries, ProductTypes, $analytics, $mdDialog, categories, utilsService) {
  //
  // DEFINITIONS
  //
  $scope.ui.display = 'editProduct'
  $scope.ProductTypes = ProductTypes
  $scope.Countries = Countries
  $scope.loading = true
  $scope.productTypeConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'productTypeId',
    labelField: 'name',
    onChange: function () {
      productEditorService.currentProduct.category = ''
      changeCategoryOptions()
      $scope.categorySelectize.refreshItems()
    }
  }
  $scope.productCategoryConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    labelField: 'item',
    valueField: 'item',
    onInitialize: function (selectize) {
      $scope.categorySelectize = selectize
    }
  }
  $scope.countrySelectConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'name',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }
  $scope.productStatusesConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'value',
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

  $scope.newTag = {
    value: ''
  }

  //
  // INITIALIZATION
  //
  productEditorService.setCurrentProduct($stateParams).then(function () {
    changeCategoryOptions()
    $scope.loading = false
  })

  //
  // SCOPE FUNCTIONS
  //
  $scope.addTag = function (newTag) {
    categories.addTag(productEditorService.currentProduct, newTag).then(product => {
      productEditorService.currentProduct = product
      $scope.newTag.value = ''
      $scope.debouncedAutosaveProduct()
    })
  }

  $scope.removeTag = function (tag) {
    categories.removeTag(productEditorService.currentProduct, tag)
    $scope.debouncedAutosaveProduct()
  }

  $scope.showMarkAsDoneDialog = function (ev) {
    $scope.genericDialog = {}
    $scope.genericDialog.title = 'Submit for Approval'
    $scope.genericDialog.body = 'This will submit the product to be reviewed by our team and if the data is accurate we will approve. If data is not accurate the product will be rejected and sent back to you.'
    $scope.genericDialog.actionText = 'Submit for Approval'
    $scope.genericDialog.actionClass = 'common-btn-positive'
    $scope.genericDialog.action = function () {
      $scope.closeDialog()
      productEditorService.submitForApproval()
    }
    $mdDialog.show(confirmationDialogOptions)
  }

  $scope.showMarkAsApproveDialog = function (ev) {
    $scope.genericDialog = {}
    $scope.genericDialog.title = 'Approve Product'
    $scope.genericDialog.body = 'Once this is marked as Approved. It will be synced with the OnCue master database and deployed to all devices.'
    $scope.genericDialog.actionText = 'Approve Product'
    $scope.genericDialog.actionClass = 'common-btn-positive'
    $scope.genericDialog.action = function () {
      $scope.closeDialog()
      productEditorService.markAsApprove()
    }
    $mdDialog.show(confirmationDialogOptions)
  }

  $scope.showDeleteProductDialog = function (ev) {
    $scope.genericDialog = {}
    $scope.genericDialog.title = 'Delete Product'
    $scope.genericDialog.body = 'Are you sure you want to delete this Product?'
    $scope.genericDialog.actionText = 'Delete Product'
    $scope.genericDialog.actionClass = 'common-btn-negative'
    $scope.genericDialog.action = function () {
      $scope.closeDialog()
      productEditorService.currentProduct.status = 'deleted'
      productEditorService.save(productEditorService.currentProduct).then(function () {
        $state.go('editor.products.view', {productId: productEditorService.currentProduct.productId})
      })
    }
    $mdDialog.show(confirmationDialogOptions)
  }

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  $scope.saveProduct = function () {
    $analytics.eventTrack('Product Saved', { productId: productEditorService.currentProduct.productId })
    productEditorService.save(productEditorService.currentProduct).then(function () {
      if (!$scope.permissions.editor && !$scope.permissions.curator) {
        $scope.ui.display = 'fulltable'
      }
    })
  }

  $scope.removeAudio = function () {
    var currentAudio = productEditorService.currentProduct.audio.mediaAssetId
    productEditorService.removeAudio(currentAudio)
  }

  $scope.debouncedAutosaveProduct = utilsService.getDebouncedFuntion(autosaveProduct)

  //
  // INTERNAL FUNCTIONS
  //
  function autosaveProduct () {
    productEditorService.save(productEditorService.currentProduct, true).then(function () {
      productEditorService.refreshProduct(productEditorService.currentProduct, true).then(function (savedProduct) {
        productEditorService.currentProduct = savedProduct
        utilsService.setAutosaveMessage($scope)
      })
    })
  }

  function changeCategoryOptions () {
    var categoriesForCurrentType = categories.categories[productEditorService.currentProduct.productTypeId]
    if (categoriesForCurrentType) {
      $scope.categoriesOptions = categoriesForCurrentType.map(function (x) { return { item: x } })
    } else {
      $scope.categoriesOptions = []
    }
  }

  function handleShortcuts (event) {
    if (event.ctrlKey || event.metaKey) {
      switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
          event.preventDefault()
          $scope.saveProduct()
          break
        case 'd':
          event.preventDefault()
          $scope.showMarkAsDoneDialog()
      }
    }
  }

  //
  // EVENTS
  //
  $(window).bind('keydown', handleShortcuts)
  $scope.$on('$destroy', function () {
    $(window).unbind('keydown', handleShortcuts)
  })
})
