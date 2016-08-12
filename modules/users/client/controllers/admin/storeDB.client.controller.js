/* globals angular, _ */
angular.module('users.admin').controller('StoreDbController', function ($scope, locationsService, orderDataService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, $q, csvStoreMapper) {
  $scope.account = undefined
  $scope.orders = []
  $scope.ordersDropdown = []
  $scope.orderItems = []

  // selectize control options
  $scope.selectStoreConfig = {
    create: true,
    createOnBlur: true,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'storeId',
    labelField: 'name',
    sortField: 'name',
    searchField: ['name', 'storeId']
  };

  $scope.selectCsvImport = function (selector) {
    $(selector).find('input[type="file"]').click();
  };

  $scope.cancelCsvImport = function (selector) {
    $scope.storeImport = null;
    var $input = $(selector).find('input[type="file"]');
    $input.replaceWith($input.val('').clone(true)); // reset selected file
  };

  // callback for csv import plugin
  $scope.selectStore = function (e) {
    console.log('csv file selected');
  };

  $scope.submitStore = function (selectedStore) {
    if (!selectedStore) {
      toastr.info('select store from the dropdown');
      return;
    }

    $scope.storeSubmitBusy = true;
    selectOrCreateStore(selectedStore).then(function (storeDb) {
      var items = csvStoreMapper.map($scope.storeImport);
      return importStoreDb(storeDb, items).then(function (order) {
        $scope.orders.push(order);
        $scope.storeImport = null;
        $scope.cancelCsvImport('#storeCsv');
        toastr.success('Order csv file imported');
      }, function (error) {
        toastr.error(error && error.toString() || 'Failed to import csv file');
      });
    }).finally(function () {
      $scope.storeSubmitBusy = false;
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

    //var url = constants.BWS_API + '/choose/orders';
    //$http.get(url).then(getStoresSuccess, getStoresError)

    var url = constants.BWS_API + '/storedb/stores';
    $http.get(url).then(getStoresSuccess, getStoresError)
  }

  function getStoresSuccess (response) {
    if (response.status === 200) {
      // timeEnd('getProductList')
      $scope.orders = response.data
      $scope.ordersDropdown = angular.copy($scope.orders);
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

  function getStoresError (error) {
    console.error('getAvailOrderError %O', error)
  }

  function handleResponse(response) {
    if (response.status !== 200) throw Error(response.statusText);
    var data = response.data;
    if (data.error) {
      console.error(data.error);
      throw Error(data.message || data.error);
    }
    return data;
  }

  function selectOrCreateStore(storeId) {
    var storeDb = _.find($scope.orders, { storeId: parseInt(storeId, 10) }) || _.find($scope.orders, { name: storeId });
    if (storeDb) return $q.when(storeDb);

    var storeName = storeId;
    var payload = {
      accountId: localStorage.getItem('accountId'),
      name: storeName
    };

    return $http.post(constants.BWS_API + '/storedb/stores', { payload: payload }).then(handleResponse).then(function (data) {
      return $http.get(constants.BWS_API + '/storedb/stores/' + data.storeId).then(handleResponse).then(function (data) {
        return data instanceof Array ? data[0] : data;
      });
    });
  }

  function importStoreDb(storeDb, storeItems) {
    var payload = {
      id: storeDb.storeId,
      items: storeItems
    };

    if (!storeDb || storeDb.length == 0) {
      return $q.reject('no store db found in csv file');
    }

    return $http.post(constants.BWS_API + '/storedb/stores/products/import', { payload: payload }).then(handleResponse);
  }
});
