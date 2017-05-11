angular.module('core').controller('EditorProductsViewController', function ($scope, $state, productEditorService, $stateParams, $mdDialog, utilsService) {
  //
  // DEFINITIONS
  //
  $scope.ui.display = 'viewProduct'

  //
  // INITIALIZATION
  //
  productEditorService.setCurrentProduct($stateParams).then(function (product) {
    $scope.ui.productTagsView = ''
    _.each(product.tags, function (t, i) {
      $scope.ui.productTagsView += t.value
      if (i !== (product.tags.length - 1)) {
        $scope.ui.productTagsView += ', '
      }
    })
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
    $mdDialog.show({
      templateUrl: '/modules/core/client/views/popupDialogs/confirmationDialog.html',
      autoWrap: true,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      hasBackdrop: true,
      clickOutsideToClose: true,
      escapeToClose: true,
      fullscreen: true
    })
  }

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  $scope.editProduct = function () {
    if (productEditorService.currentProduct.status === 'new') {
      productEditorService.changeStatusOfCurrentProduct('inprogress').then(function () {
        openEditState()
      })
    } else {
      openEditState()
    }
  }

  //
  // INTERNAL FUNCTIONS
  //
  function openEditState () {
    if (utilsService.isMatchState($state)) {
      $state.go('editor.products.matchedit', { storeId: $state.params.storeId, productId: $state.params.productId, status: $state.params.status })
    } else {
      $state.go('editor.products.edit', { productId: $state.params.productId })
    }
  }
})
