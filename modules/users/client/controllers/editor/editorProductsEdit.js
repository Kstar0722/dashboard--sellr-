angular.module('core').controller('EditorProductsEditController', function ($scope, productEditorService, $state, $stateParams, Countries, ProductTypes, $analytics, $mdDialog) {
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
    labelField: 'name'
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
  var genericDialogOptions = {
    templateUrl: '/modules/users/client/views/editor/confirmationDialog.html',
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
  // INITIALIZATION
  //
  productEditorService.setCurrentProduct($stateParams).then(function () {
    $scope.loading = false
  })

  //
  // SCOPE FUNCTIONS
  //
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
    $mdDialog.show(genericDialogOptions)
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
    $mdDialog.show(genericDialogOptions)
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
    $mdDialog.show(genericDialogOptions)
  }

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  $scope.saveProduct = function () {
    $analytics.eventTrack('Product Saved', { productId: productEditorService.currentProduct.productId })
    productEditorService.currentProduct.status = 'inprogress'
    productEditorService.save(productEditorService.currentProduct)
  }

  $scope.removeAudio = function () {
    var currentAudio = productEditorService.currentProduct.audio.mediaAssetId
    productEditorService.removeAudio(currentAudio)
  }

  //
  // INTERNAL FUNCTIONS
  //
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
