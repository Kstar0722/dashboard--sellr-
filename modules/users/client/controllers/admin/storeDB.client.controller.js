/* globals angular, _ */
angular.module('users.admin').controller('StoreDbController', function ($scope, locationsService, orderDataService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, csvStoreMapper, $q) {
  $scope.account = undefined
  $scope.orders = []
  $scope.orderItems = []

  $scope.selectCsvImport = function (selector) {
    $(selector).find('input[type="file"]').click();
  };

  $scope.submitStore = function (e) {
    var storeDb = csvStoreMapper.map($scope.storeImport);
    importStoreDb(storeDb).then(function (order) {
      $scope.orders.push(order);
      toastr.success('Order csv file imported');
    }, function (error) {
      toastr.error(error && error.toString() || 'Failed to import csv file');
    });
  };

  $scope.goToMatch = function (id) {
    orderDataService.currentOrderId = id
    orderDataService.getData(id).then(function (response) {
      $state.go('editor.match', { id: id })
    })
  }

  init();

  //
  // PRIVATE FUNCTIONS
  //

  function init() {
    if (Authentication.user) {
      $scope.account = {createdBy: Authentication.user.username}
    }

    var url = constants.BWS_API + '/choose/orders';
    $http.get(url).then(getAvailOrderSuccess, getAvailOrderError)

  }

  function getAvailOrderSuccess (response) {
    if (response.status === 200) {
      // timeEnd('getProductList')
      $scope.orders = response.data
      console.log($scope.orders)
      _.each($scope.orders, function (elm, ind, orders) {
        if (elm.status.received > 0) {
          elm.status.barClass = 'red'
        } else {
          if (elm.status.processed > 0 || elm.status.done > 0) {
            elm.status.barClass = 'orange'
          } else {
            elm.status.barClass = 'green'
          }
        }
      })
    }
  }

  function getAvailOrderError (error) {
    // #warning error is not a function
    error('getAvailOrderError %O', error)
  }

  function importStoreDb(storeDb) {
    var payload = {
      items: storeDb
    };

    if (!storeDb || storeDb.length == 0) {
      return $q.reject('no store db found in csv file');
    }

    return $http.post(constants.BWS_API + '/storedb/stores/products/import', { payload: payload })
      .then(function (response) {
        if (response.status !== 200) throw Error(response.statusText);
        var data = response.data;
        if (data.error) {
          console.error(data.error);
          throw Error(data.message || data.error);
        }
        return data;
      });
  }
});
