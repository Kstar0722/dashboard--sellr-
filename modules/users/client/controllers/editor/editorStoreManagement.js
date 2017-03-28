angular.module('core').controller('EditorStoreManagementController', function ($scope, orderDataService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, $q, csvProductMapper, storesService, UsStates, $mdDialog) {
//
  // DEFINITIONS - INITIALIZATION
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.sortExpression = '-status.received'
  $scope.orderDataService = orderDataService
  init()

  //
  // SCOPE FUNCTIONS
  //
  $scope.reOrderList = function (field) {
    var oldSort = $scope.ui.sortExpression || ''
    var asc = true
    if (oldSort.substr(1) === field) asc = oldSort[0] === '-'
    $scope.ui.sortExpression = (asc ? '+' : '-') + field
    return $scope.ui.sortExpression
  }

  $scope.goToMatch = function (store, status) {
    if (store.status[status] === 0) return
    orderDataService.currentOrderId = store.storeId
    orderDataService.getData(store, status).then(function () {
      $state.go('editor.old.match', { id: store.storeId, status: status })
    })
  }

  $scope.showUploadCVSDialog = function (ev) {
    $mdDialog.show({
      templateUrl: '/modules/users/client/views/editor/uploadCVSDialog.html',
      autoWrap: true,
      parent: angular.element(document.body),
      scope: $scope,
      preserveScope: true,
      hasBackdrop: true,
      clickOutsideToClose: false,
      escapeToClose: false,
      fullscreen: true
    })
  }

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  $scope.openMenu = function (menu, index) {
    closeMenus()
    if (!_.isUndefined(index)) {
      $scope.ui[menu][index] = true
    } else {
      $scope.ui[menu] = true
    }
  }

  //
  // PRIVATE FUNCTIONS
  //
  function init () {
    if (orderDataService.allStores.length === 0) {
      orderDataService.getAllStores().then(function (stores) {
        updateStoreColors()
      })
    }
  }

  function closeMenus () {
    $scope.ui.storeOptionsSelect = false
  }

  function updateStoreColors () {
    _.each(orderDataService.allStores, function (elm) {
      if (!elm.status) {
        elm.status = {received: 0, done: 0, new: 0, approved: 0, total: 0, inprogress: 0, barClass: 'none'}
      } else {
        if (elm.status.received > 0) {
          elm.status.barClass = 'red'
        } else {
          if (elm.status.processed > 0 || elm.status.done > 0) {
            elm.status.barClass = 'orange'
          } else {
            elm.status.barClass = 'green'
          }
        }
      }
    })
  }
})
