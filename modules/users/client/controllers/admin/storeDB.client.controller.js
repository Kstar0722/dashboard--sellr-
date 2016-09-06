/* globals angular, _, localStorage,$ */
angular.module('users.admin').controller('StoreDbController', function ($scope, locationsService, orderDataService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, $q, csvStoreMapper) {
  var EMPTY_FIELD_NAME = csvStoreMapper.EMPTY_FIELD_NAME
  var DEFAULT_STORE_FIELDS = csvStoreMapper.STORE_FIELDS

  $scope.account = undefined
  $scope.storesDropdown = []
  $scope.orderDataService = orderDataService
  $scope.importView = null
  $scope.storeFields = null
  $scope.csv = { header: true }

  // selectize control options
  $scope.selectStoreConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'storeId',
    labelField: 'name',
    searchField: [ 'name', 'storeId' ]
  }

  // selectize control options
  $scope.selectStoreFieldConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'name',
    labelField: 'displayName',
    sortField: 'displayName',
    searchField: [ 'displayName' ],
    onChange: function () {
      populateMappingDropdowns($scope.csv.columns)
    }
  }

  $scope.selectCsvImport = function (selector) {
    $(selector).find('input[type="file"]').click()
  }

  $scope.cancelCsvImport = function (selector) {
    $scope.csv = { header: true }
    var $input = $(selector).find('input[type="file"]')
    $input.replaceWith($input.val('').clone(true)) // reset selected file
  }

  // callback for csv import plugin
  $scope.initCsvImport = function (e) {
    $scope.csv.columns = initCsvColumns(_.keys(($scope.csv.result || [])[ 0 ]))
    populateMappingDropdowns($scope.csv.columns)
    $scope.csv.loaded = true
    console.log('csv file selected', $scope.csv)
  }

  $scope.submitStore = function (selectedStore) {
    if (!selectedStore) {
      toastr.error('store not selected')
      return
    }

    $scope.storeSubmitBusy = true
    try {
      selectOrCreateStore(selectedStore).then(function (store) {
        var products = csvStoreMapper.mapProducts($scope.csv.result, $scope.csv.columns)
        return importStoreProducts(store, products).then(function (store) {
          orderDataService.allStores.push(store);
          $scope.cancelImport()
          toastr.success('Store csv file imported')
        }, function (error) {
          toastr.error(error && error.toString() || 'Failed to import csv file')
        })
      }).finally(function () {
        $scope.storeSubmitBusy = false
      })
    } catch (ex) {
      console.error('unable to submit store', ex)
      $scope.storeSubmitBusy = false
    }
  }

  $scope.cancelImport = function () {
    $scope.selectedStore = null
    $scope.importView = null
    $scope.cancelCsvImport('#storeCsv')
  }

  $scope.goToMatch = function (id) {
    orderDataService.currentOrderId = id
    orderDataService.getData(id).then(function (response) {
      $state.go('editor.match', { id: id })
    })
  }

  $scope.refreshStoreStatus = function (storeId) {
    var i = _.findIndex(orderDataService.allStores, function (s) {
      return s.storeId === storeId
    })
    orderDataService.allStores[ i ].status.barClass = 'blue'
    var url = constants.BWS_API + '/storedb/stores/' + storeId
    $http.get(url).then(function (res) {
      orderDataService.allStores[ i ] = res.data[ 0 ]
      updateStoreColors()
    }, function (err) {
      console.error(err)
    })
  }

  $scope.openNewDialog = function (store) {
    if (store !== EMPTY_FIELD_NAME) return

    $scope.newStore = {
      storeId: randomId(),
      accountId: localStorage.getItem('accountId')
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

  init()

  //
  // PRIVATE FUNCTIONS
  //

  function init () {
    console.time('storeDBinit')
    if (Authentication.user) {
      $scope.account = { createdBy: Authentication.user.username }
    }
    if (orderDataService.allStores.length === 0) {
      orderDataService.getAllStores().then(function (stores) {
        updateStoreColors()

        $scope.storesDropdown = stores.slice();
        $scope.storesDropdown = _.sortBy($scope.storesDropdown, 'name');
        $scope.storesDropdown.unshift({ storeId: EMPTY_FIELD_NAME, name: 'Create New Store' });
      })
    }

    $scope.storeFields = wrapFields(DEFAULT_STORE_FIELDS)
    $scope.storeFields.unshift({ name: EMPTY_FIELD_NAME, displayName: '- Ignore Field' })

  // var url = constants.BWS_API + '/storedb/stores?supc=true'
  // $http.get(url).then(getStoresSuccess, getStoresError)
  }

  function updateStoreColors () {
    _.each(orderDataService.allStores, function (elm, ind, orders) {
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
        accountId: localStorage.getItem('accountId'),
        name: storeId.toString().trim()
      }
    }

    return $http.post(constants.BWS_API + '/storedb/stores', { payload: store }).then(handleResponse).then(function (data) {
      return getStoreById(data.storeId)
    })
  }

  function importStoreProducts (storeDb, storeItems) {
    var payload = {
      id: storeDb.storeId,
      items: storeItems
    }

    if (!storeDb || storeDb.length == 0) {
      return $q.reject('no store db found in csv file')
    }

    return $http.post(constants.BWS_API + '/storedb/stores/products/import', { payload: payload }).then(handleResponse).then(function () {
      return getStoreById(storeDb.storeId)
    })
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
    columns = wrapFields(columns)
    _.each(columns, function (col) { col.mapping = mapStoreField(col.name).name; })
    return columns
  }

  function mapStoreField (column) {
    var cUpper = column && column.toUpperCase()
    var field = cUpper && _.find($scope.storeFields, function (f) {
      return cUpper == f.name.toUpperCase() || cUpper == f.displayName.toUpperCase()
    })
    return field || _.findWhere($scope.storeFields, { name: EMPTY_FIELD_NAME })
  }

  function wrapFields (fields) {
    return _.map(fields, function (v) {
      return { name: v, displayName: toPascalCase(v) }
    })
  }

  function populateMappingDropdowns (columns) {
    var selectedMappings = _.pluck(columns, 'mapping')
    var availableFields = _.filter($scope.storeFields, function (f) {
      return f.name == EMPTY_FIELD_NAME || !_.contains(selectedMappings, f.name)
    })
    _.each(columns, function (column) {
      column.availableFields = availableFields.slice()
      var field = _.findWhere($scope.storeFields, { name: column.mapping })
      column.availableFields.push(field)
    })
    if (!$scope.$$phase) $scope.$digest()
    return availableFields
  }

  function randomId () {
    return -Math.floor(100000 * Math.random())
  }

  function findStore (arr, id) {
    return _.find(arr, { storeId: parseInt(id, 10) }) || _.find(arr, { name: id })
  }
})
