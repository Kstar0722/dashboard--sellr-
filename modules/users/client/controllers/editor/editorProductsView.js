angular.module('core').controller('EditorProductsViewController', function ($scope, Authentication, $q, $http, productEditorService, $location, $state, $stateParams, Countries, orderDataService, $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, $timeout, ProductTypes, cfpLoadingBar, $analytics, $mdDialog, $sce, globalClickEventName) {
  //
  // DEFINITIONS
  //
  productEditorService.setCurrentProduct($stateParams)
  $scope.ui.display = 'viewProduct'
  $scope.markAsNew = function (product) {
    if (product.status === 'new') return
    product.status = 'new'
    productEditorService.save(product)
  }

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
})
