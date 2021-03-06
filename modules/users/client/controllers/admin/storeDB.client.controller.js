/* globals angular, _, localStorage,$ */
angular.module('core').controller('StoreDbController', function ($scope, orderDataService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, $q, csvProductMapper, storesService, UsStates) {
  var EMPTY_FIELD_NAME = csvProductMapper.EMPTY_FIELD_NAME

  $scope.states = UsStates
  $scope.account = undefined
  $scope.storesDropdown = []
  $scope.orderDataService = orderDataService
  $scope.importView = null
  $scope.storeFields = null
  $scope.csv = { header: true }
  $scope.sortExpression = '-status.received'

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

  $scope.submitStore = function (storeId) {
    if (!storeId) {
      toastr.error('store not selected')
      return
    }

    $scope.storeSubmitBusy = true
    try {
      var store = findStore(orderDataService.allStores, storeId)
      var products = csvProductMapper.mapProducts($scope.csv.result, $scope.csv.columns)
      storesService.importStoreProducts(store, products)
        .then(function () {
          orderDataService.getAllStores().then(function () {
            $scope.cancelImport()
            toastr.success('Store csv file imported')
          })
        })
        .catch(function (error) {
          console.error(error)
          toastr.error('Failed to import csv file')
        })
        .finally(function () {
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

  $scope.goToMatch = function (store, status) {
    if (store.status[status] === 0) return
    orderDataService.currentOrderId = store.storeId
    orderDataService.getData(store, status).then(function (response) {
      $state.go('editor.match', { id: store.storeId, status: status })
    })
  }

  $scope.openNewDialog = function (store) {
    if (store !== EMPTY_FIELD_NAME) return

    $scope.newStore = {
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
    storesService.createStore(newStore).then(function (data) {
      toastr.success('New Store Created', 'Success!')
      newStore.storeId = data.storeId
      orderDataService.allStores.push(newStore)
      $scope.storesDropdown.splice(1, 0, newStore)
      $scope.selectedStore = newStore.storeId
      $('#createStoreModal').modal('hide')
    })
  }

  $scope.reOrderList = function (field) {
    var oldSort = $scope.sortExpression || ''
    var asc = true
    if (oldSort.substr(1) === field) asc = oldSort[0] === '-'
    $scope.sortExpression = (asc ? '+' : '-') + field
    return $scope.sortExpression
  }

  init()

  //
  // PRIVATE FUNCTIONS
  //

  function init () {
    console.time('storeDBinit')

    if (Authentication.user) {
      $scope.account = { createdBy: Authentication.user.firstName + ' ' + Authentication.user.lastName }
    }
    if (orderDataService.allStores.length === 0) {
      orderDataService.getAllStores().then(function (stores) {
        updateStoreColors()

        $scope.storesDropdown = stores.slice()
        $scope.storesDropdown = _.sortBy($scope.storesDropdown, 'name')
        $scope.storesDropdown.unshift({ storeId: EMPTY_FIELD_NAME, name: 'Create New Store' })
      })
    }

    $scope.storeFields = wrapFields(csvProductMapper.PRODUCT_FIELDS)
    $scope.storeFields.unshift({ name: EMPTY_FIELD_NAME, displayName: '- Ignore Field' })
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

  function toPascalCase (str) {
    if (!str) return str
    var words = _.compact(str.split(/\s+/))
    var result = words.map(function (w) { return w[ 0 ].toUpperCase() + w.substr(1) }).join(' ')
    return result
  }

  function initCsvColumns (columns) {
    columns = wrapFields(columns)
    _.each(columns, function (col) { col.mapping = mapStoreField(col.name).name })
    return columns
  }

  function mapStoreField (column) {
    var cUpper = column && column.toUpperCase()
    var field = cUpper && _.find($scope.storeFields, function (f) {
      return cUpper === f.name.toUpperCase() || cUpper === f.displayName.toUpperCase()
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
      return f.name === EMPTY_FIELD_NAME || !_.contains(selectedMappings, f.name)
    })
    _.each(columns, function (column) {
      column.availableFields = availableFields.slice()
      var field = _.findWhere($scope.storeFields, { name: column.mapping })
      if (field) column.availableFields.push(field)
    })
    if (!$scope.$$phase) $scope.$digest()
    return availableFields
  }

  function findStore (arr, id) {
    return _.find(arr, { storeId: parseInt(id, 10) }) || _.find(arr, { name: id })
  }
})
