angular.module('core').controller('EditorStoreManagementController', function ($scope, orderDataService, $state, toastr, csvProductMapper, storesService, $mdDialog, $rootScope, globalClickEventName) {
  //
  // DEFINITIONS
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.sortExpression = '-status.received'
  $scope.orderDataService = orderDataService
  $scope.storeFields = null
  $scope.csv = {header: true, view: 'import'}
  $scope.selectStoresConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'storeId',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }
  $scope.selectFieldsConfig = {
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
  var CSV_SELECTOR = '#csvimporter'
  var EMPTY_FIELD_NAME = csvProductMapper.EMPTY_FIELD_NAME

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

  //
  // CSV STUFF
  //
  $scope.openCsvImport = function () {
    $(CSV_SELECTOR).find('input[type="file"]').click()
  }

  // callback for csv import plugin
  $scope.initCsvImport = function (e) {
    $scope.csv.columns = initCsvColumns(_.keys(($scope.csv.result || [])[ 0 ]))
    populateMappingDropdowns($scope.csv.columns)
    $scope.csv.loaded = true
    console.log('csv file selected', $scope.csv)
  }

  $scope.showUploadCsvDialog = function (ev) {
    $mdDialog.show({
      templateUrl: '/modules/users/client/views/popupDialogs/uploadCsvDialog.html',
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
    $scope.csv = {header: true, view: 'import'}
    var $input = $(CSV_SELECTOR).find('input[type="file"]')
    $input.replaceWith($input.val('').clone(true)) // reset selected file
    $mdDialog.hide()
  }

  $scope.submitCSV = function () {
    if (!$scope.csv.storeId) {
      toastr.error('Store not selected')
      return
    }
    try {
      var store = _.find(orderDataService.allStores, { storeId: parseInt($scope.csv.storeId, 10) })
      var products = csvProductMapper.mapProducts($scope.csv.result, $scope.csv.columns)
      $scope.closeDialog()
      storesService.importStoreProducts(store, products)
        .then(function () {
          orderDataService.getAllStores().then(function () {
            toastr.success('Store csv file imported successfully')
          })
        })
        .catch(function () {
          toastr.error('Failed to import csv file')
        })
    } catch (ex) {
      toastr.error('Failed to import csv file')
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
    } else {
      updateStoreColors()
    }
    $scope.storeFields = wrapFields(csvProductMapper.PRODUCT_FIELDS)
    $scope.storeFields.unshift({ name: EMPTY_FIELD_NAME, displayName: '- Ignore Field' })
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

  function toPascalCase (str) {
    if (!str) return str
    var words = _.compact(str.split(/\s+/))
    var result = words.map(function (w) { return w[ 0 ].toUpperCase() + w.substr(1) }).join(' ')
    return result
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

  //
  // EVENTS
  //
})
