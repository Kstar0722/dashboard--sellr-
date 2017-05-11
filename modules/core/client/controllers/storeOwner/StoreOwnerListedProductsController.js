angular.module('core').controller('StoreOwnerListedProductsController', function ($scope, $stateParams, $state, $mdDialog) {
  console.log('LISTED PRODUCTS CTRL')
  $scope.ui = {}
  $scope.ui.checkmarkplaceholder = false

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
})
