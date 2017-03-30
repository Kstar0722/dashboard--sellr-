angular.module('core').controller('EditorProductsMasterController', function ($scope, Authentication, $q, $http, productEditorService, $location, $state, $stateParams, Countries, orderDataService, $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, $timeout, ProductTypes, cfpLoadingBar, $analytics, $mdDialog, $sce, globalClickEventName) {
  //
  // DEFINITIONS - INITIALIZATION
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.sortExpression = '+name'
  $scope.selectStoreFilterConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'name',
    labelField: 'displayName',
    sortField: 'displayName',
    searchField: [ 'displayName' ]
  }
  $scope.pes = productEditorService
  $scope.mergeService = mergeService
  $scope.orderDataService = orderDataService
  productEditorService.checkForNewProducts()
  $scope.newProductsLabel = 'New Products Available'
  $scope.newProductLimit = 0
  $scope.loadNewProducts = function () {
    $scope.newProductsLabel = 'Load more new products'
    $scope.loadingData = true
    $scope.newProductLimit += 100
    // this is a hack to force angular to redraw the page
    $timeout(function () {
      productEditorService.viewNewProducts($scope.newProductLimit).then(function () {
        $scope.loadingData = false
      })
    }, 0)
  }

  //
  // SCOPE FUNCTIONS
  //
  $scope.openMenu = function (menu, index) {
    closeMenus()
    if (!_.isUndefined(index)) {
      $scope.ui[menu][index] = true
    } else {
      $scope.ui[menu] = true
    }
  }

  //
  // INTERNAL FUNCTIONS
  //
  function closeMenus () {
    $scope.ui.searchOptionsMenu = false
  }

  //
  // EVENTS
  //
  // var unregisterGlobalClick = $rootScope.$on(globalClickEventName, function (event, targetElement) {
  //   if (targetElement.className.indexOf('ignore-click-trigger') === -1) {
  //     $scope.$apply(function () {
  //       closeMenus()
  //     })
  //   }
  // })

  // MANDATORY to prevent Leak
  // $scope.$on('$destroy', unregisterGlobalClick)
})
