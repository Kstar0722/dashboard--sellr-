angular.module('core').controller('StoreOwnerListedProductsController', function ($scope, $stateParams, $state, $mdDialog) {
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.checkmarkplaceholder = false
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
})
