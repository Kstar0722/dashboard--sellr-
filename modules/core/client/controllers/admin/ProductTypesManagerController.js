angular.module('core').controller('ProductTypesManagerController', function ($scope, $state, toastr, ProductTypesService, $q) {
  //
  // DEFINITIONS
  //
  var pts = ProductTypesService
  $scope.ui = {}
  $scope.ui.activeType = null
  $scope.ui.searchType = ''
  var defaultType = {
    name: '',
    properties: [
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
  var defaultTypeProperty = {
    label: '',
    options: pts.getDefaultPropertyOptions()
  }
  $scope.typeProperties = [{name: 'Text Input'}, {name: 'Select Dropdown'}, {name: 'List'}]
  $scope.typePropertiesConfig = {
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
      var promises = []
      _.each($scope.ui.activeType.properties, function (prop) {
        if (prop.propId) {
          if (prop.setToRemove) {
            promises.push(pts.deleteProductTypeProperty(prop))
          } else {
            promises.push(pts.updateProductTypeProperty(prop))
          }
        } else {
          if (!prop.setToRemove) {
            promises.push(pts.createProductTypeProperty($scope.ui.activeType.productTypeId, prop))
          }
        }
      })
      $q.all(promises).then(function () {
        init()
      })
    })
  }

  $scope.removeProp = function (prop) {
    prop.setToRemove = true
  }

  $scope.editType = function (type) {
    pts.getProductTypeProperties(type.productTypeId).then(function (properties) {
      var activeType = angular.copy(type)
      activeType.properties = properties
      $scope.ui.activeType = activeType
      console.log(activeType)
    })
  }

  $scope.addNewType = function () {
    $scope.ui.activeType = defaultType
  }

  $scope.addTypeProperty = function () {
    $scope.ui.activeType.properties.push(angular.copy(defaultTypeProperty))
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
