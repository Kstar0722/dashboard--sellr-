angular.module('core').controller('CsvImporterController', function ($scope, orderDataService, toastr, csvProductMapper, storesService, $mdDialog) {
  //
  // DEFINITIONS
  //
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
      })
    }
    $scope.storeFields = wrapFields(csvProductMapper.PRODUCT_FIELDS)
    $scope.storeFields.unshift({ name: EMPTY_FIELD_NAME, displayName: '- Ignore Field' })
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
})
