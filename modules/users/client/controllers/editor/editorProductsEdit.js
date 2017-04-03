angular.module('core').controller('EditorProductsEditController', function ($scope, Authentication, $q, $http, productEditorService, $location, $state, $stateParams, Countries, orderDataService, $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, $timeout, ProductTypes, cfpLoadingBar, $analytics, $mdDialog, $sce, globalClickEventName) {
  //
  // DEFINITIONS
  //
  $scope.ui.display = 'editProduct'
  $scope.ProductTypes = ProductTypes
  $scope.loading = true
  productEditorService.setCurrentProduct($stateParams).then(function () {
    $scope.loading = false
  })

  $scope.permissions = {
    editor: Authentication.user.roles.indexOf(1010) > -1 || Authentication.user.roles.indexOf(1004) > -1,
    curator: Authentication.user.roles.indexOf(1011) > -1 || Authentication.user.roles.indexOf(1004) > -1
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

  $scope.showMarkAsApproveDialog = function (ev) {
    $scope.genericDialog = {}
    $scope.genericDialog.title = 'Approve Product'
    $scope.genericDialog.body = 'Once this is marked as Approved. It will be synced with the OnCue master database and deployed to all devices.'
    $scope.genericDialog.actionText = 'Approve Product'
    $scope.genericDialog.action = function () {
      $scope.closeDialog()
      productEditorService.markAsApprove()
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

  $scope.saveProduct = function () {
    $analytics.eventTrack('Product Saved', { productId: productEditorService.currentProduct.productId })
    productEditorService.currentProduct.status = 'inprogress'
    productEditorService.save(productEditorService.currentProduct)
  }

  $scope.productTypeConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'productTypeId',
    labelField: 'name'
  }

  $scope.removeAudio = function () {
    var currentAudio = productEditorService.currentProduct.audio.mediaAssetId
    productEditorService.removeAudio(currentAudio)
  }
})
