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
