angular.module('core').controller('ProductTypesManagerController', function ($scope, $state, toastr, ProductTypesService) {
  //
  // DEFINITIONS
  //
  var pts = ProductTypesService
  $scope.ui = {}
  $scope.ui.activeType = null
  $scope.ui.searchType = ''
  var defaultType = {
    name: '',
    fields: [
      {
        type: 'Text Input',
        label: '',
        instructions: '',
        ownercanedit: false,
        editorcanedit: false,
        selectOptions: ''
      }
    ]
  }
  var defaultTypeField = {
    label: '',
    options: pts.getDefaultPropertyOptions()
  }
  $scope.typeFields = [{name: 'Text Input'}, {name: 'Select Dropdown'}, {name: 'List'}]
  $scope.typeFieldsConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'name',
    labelField: 'name',
    sortField: 'name',
    searchField: ['name']
  }

  //
  // INITIALIZATION
  //
  init()

  //
  // SCOPE FUNCTIONS
  //

  $scope.saveActiveType = function () {
    pts.updateProductType($scope.ui.activeType.productTypeId, $scope.ui.activeType.friendlyName).then(function () {
      init()
    })
  }

  $scope.editType = function (type) {
    console.log(type)
    pts.getProductTypeProperties(type.productTypeId).then(function (properties) {
      var activeType = angular.copy(type)
      activeType.properties = properties
      $scope.ui.activeType = activeType
    })
  }

  $scope.addNewType = function () {
    $scope.ui.activeType = defaultType
  }

  $scope.addTypeField = function () {
    $scope.ui.activeType.fields.push(angular.copy(defaultTypeField))
  }

  //
  // INTERNAL FUNCTIONS
  //
  function init () {
    pts.getProductTypes().then(function (types) {
      $scope.ui.types = types
    })
  }

  //
  // EVENTS
  //
})
