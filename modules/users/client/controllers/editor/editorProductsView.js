angular.module('core').controller('EditorProductsViewController', function ($scope, Authentication, $q, $http, productEditorService, $location, $state, $stateParams, Countries, orderDataService, $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, $timeout, ProductTypes, cfpLoadingBar, $analytics, $mdDialog, $sce, globalClickEventName) {
  //
  // DEFINITIONS
  //
  $scope.ui.display = 'viewProduct'
  $scope.loading = true
  productEditorService.setCurrentProduct($stateParams).then(function () {
    $scope.loading = false
  })

  $scope.showMarkAsDoneDialog = function (ev) {
    $scope.genericDialog = {}
    $scope.genericDialog.title = 'Submit for Approval'
    $scope.genericDialog.body = 'This will submit the product to be reviewed by our team and if the data is accurate we will approve. If data is not accurate the product will be rejected and sent back to you.'
    $scope.genericDialog.actionText = 'Submit for Approval'
    $scope.genericDialog.action = function () {
      $scope.closeDialog()
      productEditorService.submitForApproval()
    }
    $mdDialog.show({
      templateUrl: '/modules/users/client/views/editor/confirmationDialog.html',
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
    if ($state.current.name.indexOf('editor.products.match') === 0) {
      $state.go('editor.products.matchedit', { storeId: $state.params.storeId, productId: $state.params.productId, status: $state.params.status })
    } else {
      $state.go('editor.products.edit', { productId: $state.params.productId })
    }
  }
})
