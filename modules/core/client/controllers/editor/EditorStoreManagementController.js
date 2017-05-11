angular.module('core').controller('EditorStoreManagementController', function ($scope, orderDataService, $state, $mdDialog) {
  //
  // DEFINITIONS
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.sortExpression = '-status.received'
  $scope.orderDataService = orderDataService

  //
  // INITIALIZATION
  //
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
      $state.go('editor.products.match', { storeId: store.storeId, status: status })
    })
  }

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

  //
  // PRIVATE FUNCTIONS
  //
  function init () {
    if (orderDataService.allStores.length === 0) {
      orderDataService.getAllStores().then(function (stores) {
        updateStoreColors()
      })
    } else {
      updateStoreColors()
    }
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
