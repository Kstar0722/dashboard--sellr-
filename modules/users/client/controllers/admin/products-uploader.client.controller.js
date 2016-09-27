/* globals angular, _, $ */
angular.module('users.admin').controller('ProductsUploaderController', function ($scope, locationsService, orderDataService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, $q, csvCustomProductMapper, $timeout) {
  var EMPTY_FIELD_NAME = csvCustomProductMapper.EMPTY_FIELD_NAME
  var FIELD_TYPES = csvCustomProductMapper.FIELD_TYPES;

  $scope.storesDropdown = []
  $scope.orderDataService = orderDataService
  $scope.importView = 'upload_file'
  $scope.storeFields = null
  $scope.planName = null
  $scope.csv = { header: true }
  $scope.fieldTypesDropdown = FIELD_TYPES;

  accountsService.bindSelectedAccount($scope);
  $scope.$watch('selectAccountId', function (selectAccountId, prevValue) {
    if (selectAccountId == prevValue) return;
    init(selectAccountId);
  });

  // selectize control options
  $scope.selectStoreConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'storeId',
    labelField: 'name',
    searchField: [ 'name', 'storeId' ]
  }

  $scope.updateColumnMapping = function (column) {
    var value = column.mapping;
    if (value == EMPTY_FIELD_NAME) {
      column.mapping = column.name;
      column.new = true;
    }
    else {
      column.new = false;
    }
    if (!$scope.$$phase) $scope.$digest()
    populateMappingDropdowns($scope.csv.columns)
  };

  $scope.selectCsvImport = function (selector) {
    $(selector).find('input[type="file"]').click()
  }

  $scope.cancelCsvImport = function (selector) {
    $scope.csv = { header: true }
    $scope.planName = null
    var $input = $(selector).find('input[type="file"]')
    $input.replaceWith($input.val('').clone(true)) // reset selected file
  }

  // callback for csv import plugin
  $scope.initCsvImport = function (e) {
    $scope.csv.columns = initCsvColumns(_.keys(($scope.csv.result || [])[ 0 ]))
    $scope.csv.result = skipBlankRows($scope.csv.result);
    populateMappingDropdowns($scope.csv.columns)
    $scope.csv.loaded = true
    if (!$scope.$$phase) $scope.$digest();
    console.log('csv file selected', $scope.csv)
  }

  $scope.submitStore = function (selectedStore) {
    if (!selectedStore) {
      toastr.error('store not selected')
      return
    }

    $scope.productsSubmitBusy = true
    try {
      selectOrCreateStore(selectedStore).then(function (store) {
        var products = csvCustomProductMapper.mapProducts($scope.csv.result, $scope.csv.columns);
        return importPlanProducts(store, products).then(function () {
          $scope.cancelImport()
          toastr.success('Products csv file imported')
        }, function (error) {
          toastr.error(error && error.toString() || 'Failed to import csv file')
        })
      }).finally(function () {
        $scope.productsSubmitBusy = false
      })
    } catch (ex) {
      console.error('unable to submit store', ex)
      $scope.productsSubmitBusy = false
    }
  }

  $scope.cancelImport = function () {
    $scope.selectedStore = null
    $scope.importView = 'upload_file'
    $scope.cancelCsvImport('#storeCsv')
  }

  $scope.openNewDialog = function (store) {
    if (store !== EMPTY_FIELD_NAME) return

    $scope.newStore = {
      storeId: randomId(),
      accountId: $scope.selectAccountId
    }

    var $createModal = $('#createStoreModal').on('shown.bs.modal', function (e) {
      var autofocus = $(e.target).find('[autofocus]')[ 0 ]
      if (autofocus) autofocus.focus()
    })

    $createModal.modal('show')
  }

  $scope.selectNewStore = function (newStore) {
    if (!newStore) return
    $scope.storesDropdown.splice(1, 0, newStore)
    $scope.selectedStore = newStore.storeId || newStore.name
  }

  $scope.parseColumn0 = function (content) {
    var line0 = ((content || '').match(/^(.*)\n/) || [])[1];
    var names = csvCustomProductMapper.mapList(line0);
    return names.map(function(n, i) {
      return { name: n, id: 'c' + i + '_' + n }
    });
  };

  $scope.skip = function (columns) {
    _.forEach(columns, function (c) {
      c.mapping = null;
      c.unmatched = false;
      c.editing = null;
      c.skipped = true;
    });

    populateMappingDropdowns($scope.csv.columns)
    editNextUnmatched(columns[0]);
  };

  $scope.unmatched = function (columns) {
    return _.filter(columns, { unmatched: true });
  };

  $scope.unskipped = function (columns) {
    return _.filter(columns, { skipped: false });
  };

  $scope.saveMatching = function (column, next) {
    if (!column) return;

    angular.extend(column, column.editing);
    column.editing = null;

    if (column.mapping) {
      column.skipped = false;
      column.unmatched = false;
    }

    populateMappingDropdowns($scope.csv.columns)
    if (next) editNextUnmatched(column);
  };

  $scope.cancelEditing = function (column) {
    column.editing = null;
  };

  $scope.columnClasses = function (column) {
    if (!column) return null;
    return [column.editing && 'editing', column.unmatched && 'unmatched', column.skipped && 'skipped'];
  };

  $scope.editColumn = function (column) {
    $scope.saveMatching(editingColumn());
    column.editing = null;
    return column.editing = angular.copy(column);
  };

  $scope.editPrev = function (column) {
    $scope.saveMatching(editingColumn());
    var columns = $scope.csv.columns;
    var idx = _.indexOf(columns, column);
    var prevCol = columns[idx - 1];
    if (prevCol) $scope.editColumn(prevCol);
  };

  $scope.resetColumn = function (column) {
    column.mapping = null;
    column.editing = null;
    column.skipped = false;
    column.unmatched = true;

    populateMappingDropdowns($scope.csv.columns)
  };

  $scope.columnType = function (column) {
    if (column.fieldType) return column.fieldType;
    if (column.mapping == 'image') return 'url';
    if (column.mapping == 'skus') return 'list';
    return 'text';
  };

  init()

  //
  // PRIVATE FUNCTIONS
  //

  function init (accountId) {
    console.time('productsUploader:init')

    if (orderDataService.allStores.length === 0 || accountId) {
      orderDataService.getAllStores({ accountId: accountId || $scope.selectAccountId }).then(function (stores) {
        $scope.storesDropdown = stores.slice();
        $scope.storesDropdown = _.sortBy($scope.storesDropdown, 'name');
        $scope.storesDropdown.unshift({ storeId: EMPTY_FIELD_NAME, name: 'Create New Store' });
      })
    }

    $scope.storeFields = wrapFields(csvCustomProductMapper.PRODUCT_FIELDS)
    $scope.storeFields.unshift({ name: EMPTY_FIELD_NAME, displayName: 'Create a New Column' })
  }

  function handleResponse (response) {
    if (response.status !== 200) throw Error(response.statusText)
    var data = response.data
    if (data.error) {
      console.error(data.error)
      throw Error(data.message || data.error)
    }
    return data
  }

  function selectOrCreateStore (storeId) {
    var store = findStore(orderDataService.allStores, storeId)
    if (store) return $q.when(store) // already exists

    store = findStore($scope.storesDropdown, storeId)

    if (!store) {
      store = {
        accountId: $scope.selectAccountId,
        name: storeId.toString().trim()
      }
    }

    return $http.post(constants.BWS_API + '/storedb/stores', { payload: store }).then(handleResponse).then(function (data) {
      return getStoreById(data.storeId)
    })
  }

  function importPlanProducts (store, products) {
    var payload = {
      custom: true,
      storeId: store.storeId,
      accountId: store.accountId,
      label: $scope.planName,
      products: products
    };

    if (!products || products.length == 0) {
      return $q.reject('no products found in csv file')
    }

    return $http.post(constants.BWS_API + '/choose/plans', { payload: payload }).then(handleResponse);
  }

  function getStoreById (id) {
    return $http.get(constants.BWS_API + '/storedb/stores/' + id).then(handleResponse).then(function (data) {
      return data instanceof Array ? data[ 0 ] : data
    })
  }

  function toPascalCase (str) {
    if (!str) return str
    var words = _.compact(str.split(/\s+/))
    var result = words.map(function (w) { return w[ 0 ].toUpperCase() + w.substr(1); }).join(' ')
    return result
  }

  function initCsvColumns (columns) {
    columns = trimEndBlankColumns(columns);

    columns = wrapFields(columns)
    var editing = null;
    _.each(columns, function (col, i) {
      col.id = 'c' + i + '_' + col.name;
      col.mapping = mapStoreField(col.name).name;
      if (col.mapping == EMPTY_FIELD_NAME) col.mapping = '';

      col.unmatched = !col.mapping || col.mapping == EMPTY_FIELD_NAME;
      if (!editing && col.unmatched) col.editing = editing = true;
    })
    return columns
  }

  function trimEndBlankColumns(arr) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (!arr[i] || ignoreField(arr[i])) arr.length--;
      else break;
    }
    return arr;
  }

  function skipBlankRows(rows) {
    var nonEmptyRows = _.filter(rows, function(row) {
      return _.some(row, function(cValue, cName) { return cValue != '' && !ignoreField(cName); });
    });

    // since input rows is not just Array and contains extra properties from angular-csv-import,
    // just splice it and push filtered rows
    rows.length = 0;
    rows.splice.apply(rows, [0, 0].concat(nonEmptyRows));

    return rows;
  }

  function mapStoreField (column) {
    var cUpper = column && column.toUpperCase()
    var field = cUpper && _.find($scope.storeFields, function (f) {
        return cUpper == f.name.toUpperCase() || cUpper == f.displayName.toUpperCase()
      })
    return field || _.findWhere($scope.storeFields, { name: EMPTY_FIELD_NAME })
  }

  function wrapFields (fields) {
    return _.compact(_.map(fields, function (v) {
      if (ignoreField(v)) return;
      return { name: v, displayName: toPascalCase(v) }
    }))
  }

  function ignoreField(fieldName) {
    if (!fieldName) return true;
    return fieldName.match(/^\$\$/);
  }

  function populateMappingDropdowns (columns) {
    var selectedMappings = _.map(columns, function(c) { return (c.editing || c).mapping; });
    var availableFields = _.filter($scope.storeFields, function (f) {
      return f.name == EMPTY_FIELD_NAME || !_.contains(selectedMappings, f.name)
    })
    _.each(columns, function (column) {
      column.availableFields = availableFields.slice()
      var field = _.findWhere($scope.storeFields, { name: (column.editing || column).mapping })
      if (field) column.availableFields.push(field)
    })
    return availableFields
  }

  function randomId () {
    return -Math.floor(100000 * Math.random())
  }

  function findStore (arr, id) {
    return _.find(arr, { storeId: parseInt(id, 10) }) || _.find(arr, { name: id })
  }

  function editNextUnmatched(column) {
    var columns = $scope.csv.columns;
    var idx = columns.indexOf(column);
    var nextColumns = columns.slice(idx > 0 ? idx : 0);
    var nextUnmatched = $scope.unmatched(nextColumns)[0] || $scope.unmatched(columns)[0];
    if (nextUnmatched) $scope.editColumn(nextUnmatched);
  }

  function editingColumn() {
    return _.find($scope.csv.columns, function(c) { return c.editing; });
  }
})
