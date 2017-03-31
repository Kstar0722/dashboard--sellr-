angular.module('core').controller('EditorProductsViewController', function ($scope, Authentication, $q, $http, productEditorService, $location, $state, $stateParams, Countries, orderDataService, $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, $timeout, ProductTypes, cfpLoadingBar, $analytics, $mdDialog, $sce, globalClickEventName) {
  //
  // DEFINITIONS
  //
  productEditorService.setCurrentProduct($stateParams)
  $scope.ui.display = 'viewProduct'
  console.log('DIEGOOOOO')
})
