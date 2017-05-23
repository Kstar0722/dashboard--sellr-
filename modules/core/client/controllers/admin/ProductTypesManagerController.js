angular.module('core').controller('ProductTypesManagerController', function ($scope, $state, toastr, ProductTypesService) {
  //
  // DEFINITIONS
  //
  var pts = ProductTypesService
  $scope.ui = {}
  $scope.ui.activeType = null
  $scope.ui.searchType = ''
  var defaultType = {
    name: 'New Type',
    industry: '',
    image: '/img/beer_grey_placeholder.png',
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

  //
  // INITIALIZATION
  //
  pts.getProductTypes().then(function (types) {
    $scope.ui.types = types
  })

  //
  // SCOPE FUNCTIONS
  //

  $scope.addNewType = function () {
    $scope.hardcodedTypesData.push(angular.copy(defaultType))
    $scope.ui.activeType = $scope.hardcodedTypesData[$scope.hardcodedTypesData.length - 1]
  }

  // $scope.addTypeField = function () {
  //   $scope.ui.activeType.fields.push(angular.copy(defaultTypeField))
  // }

  //
  // INTERNAL FUNCTIONS
  //

  //
  // EVENTS
  //
})
