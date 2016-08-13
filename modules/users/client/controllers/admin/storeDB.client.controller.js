/* globals angular, _ */
angular.module('users.admin').controller('StoreDbController', function ($scope, locationsService, orderDataService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, $q, csvStoreMapper) {
  var EMPTY_FIELD_NAME = csvStoreMapper.EMPTY_FIELD_NAME;
  var DEFAULT_STORE_FIELDS = csvStoreMapper.STORE_FIELDS;

  $scope.account = undefined
  $scope.orders = []
  $scope.orderItems = []
  $scope.storesDropdown = []
  $scope.importView = null;
  $scope.storeFields = null;
  $scope.csv = { header: true };

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

  // selectize control options
  $scope.selectStoreFieldConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'name',
    labelField: 'displayName',
    sortField: 'displayName',
    searchField: ['displayName'],
    onDropdownOpen: function ($dropdown) {
      console.log($dropdown);
    }
  };

  $scope.selectCsvImport = function (selector) {
    $(selector).find('input[type="file"]').click();
  };

  $scope.cancelCsvImport = function (selector) {
    $scope.csv = { header: true };
    var $input = $(selector).find('input[type="file"]');
    $input.replaceWith($input.val('').clone(true)); // reset selected file
  };

  // callback for csv import plugin
  $scope.initCsvImport = function (e) {
    $scope.csv.columns = initCsvColumns(_.keys(($scope.csv.result || [])[0]));
    $scope.csv.loaded = true;
    console.log('csv file selected', $scope.csv);
  };

  $scope.submitStore = function (selectedStore) {
    if (!selectedStore) {
      toastr.error('store not selected');
      return;
    }

    $scope.storeSubmitBusy = true;
    selectOrCreateStore(selectedStore).then(function (store) {
      var products = csvStoreMapper.mapProducts($scope.csv.result, $scope.csv.columns);
      return importStoreProducts(store, products).then(function (store) {
        debugger;
        $scope.orders.push(store);
        $scope.cancelImport();
        toastr.success('Store csv file imported');
      }, function (error) {
        toastr.error(error && error.toString() || 'Failed to import csv file');
      });
    }).finally(function () {
      $scope.storeSubmitBusy = false;
    });
  };

  $scope.cancelImport = function () {
    $scope.selectedStore = null;
    $scope.importView = null;
    $scope.cancelCsvImport('#storeCsv');
  };

  $scope.goToMatch = function (id) {
    orderDataService.currentOrderId = id
    orderDataService.getData(id).then(function (response) {
      $state.go('editor.match', { id: id })
    })
  }

  $scope.$watch('csv.header', function () {
    $scope.csv.loaded = false;
    // trigger csv.result recalculating out of digest cycle (specific to angular-csv-import flow)
    setTimeout(function () {
      $('#storeCsv').find('.separator-input').triggerHandler('keyup');
      $scope.csv.loaded = true;
      $scope.$digest();
    });
  });

  init();

  //
  // PRIVATE FUNCTIONS
  //

  function init() {
    if (Authentication.user) {
      $scope.account = {createdBy: Authentication.user.username}
    }

    $scope.storeFields = wrapFields(DEFAULT_STORE_FIELDS);
    $scope.storeFields.unshift({ name: EMPTY_FIELD_NAME, displayName: '- Ignore Field' });

    $scope.csv.columns = initCsvColumns(['col1', 'description', 'sku', 'name']);

    var url = constants.BWS_API + '/storedb/stores';
    $http.get(url).then(getStoresSuccess, getStoresError);
  }

  function getStoresSuccess (response) {
    if (response.status === 200) {
      // timeEnd('getProductList')
      $scope.orders = response.data
      $scope.storesDropdown = angular.copy($scope.orders);
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
    console.error('getStoresError %O', error)
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
      name: storeName.trim()
    };

    return $http.post(constants.BWS_API + '/storedb/stores', { payload: payload }).then(handleResponse).then(function (data) {
      return getStoreById(data.storeId);
    });
  }

  function importStoreProducts(storeDb, storeItems) {
    var payload = {
      id: storeDb.storeId,
      items: storeItems
    };

    if (!storeDb || storeDb.length == 0) {
      return $q.reject('no store db found in csv file');
    }

    return $http.post(constants.BWS_API + '/storedb/stores/products/import', { payload: payload }).then(handleResponse).then(function () {
      return getStoreById(storeDb.storeId);
    });
  }

  function getStoreById(id) {
    return $http.get(constants.BWS_API + '/storedb/stores/' + id).then(handleResponse).then(function (data) {
      return data instanceof Array ? data[0] : data;
    });
  }

  function toPascalCase(str) {
    if (!str) return str;
    var words = _.compact(str.split(/\s+/));
    var result = words.map(function (w) { return w[0].toUpperCase() + w.substr(1); }).join(' ');
    return result;
  }

  function initCsvColumns(columns) {
    columns = wrapFields(columns);
    _.each(columns, function (col) {
      col.selectConfig = angular.copy($scope.selectStoreFieldConfig);
      col.mapping = mapStoreField(col.name).name;
    });
    return columns;
  }

  function mapStoreField(column) {
    var cUpper = column && column.toUpperCase();
    var field = cUpper && _.find($scope.storeFields, function (f) {
      return cUpper == f.name.toUpperCase() || cUpper == f.displayName.toUpperCase();
    });
    return field || _.findWhere($scope.storeFields, { name: EMPTY_FIELD_NAME });
  }

  function wrapFields(fields) {
    return _.map(fields, function (v) {
      return { name: v, displayName: toPascalCase(v) };
    });
  }
});
