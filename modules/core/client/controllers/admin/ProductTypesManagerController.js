angular.module('core').controller('ProductTypesManagerController', function ($scope, $state, toastr) {
  //
  // DEFINITIONS - INITIALIZATION
  //
  console.log('PRODUCT TYPES')
  $scope.ui = {}
  var defaultFormElement = {
    type: 'Text Input',
    ownercanedit: false,
    editorcanedit: false
  }
  $scope.ui.formElements = [angular.copy(defaultFormElement)]
  $scope.ui.industryFilter = 'All Industries'
  $scope.industryTypes = [{name: 'All Industries'}, {name: 'Berverage'}, {name: 'Pharmacy'}]
  $scope.industryTypeConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'name',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }
  $scope.formElementTypes = [{name: 'Text Input'}, {name: 'Select Dropdown'}, {name: 'List'}]
  $scope.formElementTypeConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'name',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }

  $scope.addFormElement = function () {
    $scope.ui.formElements.push(angular.copy(defaultFormElement))
  }

  //
  // SCOPE FUNCTIONS
  //
  //
  // INTERNAL FUNCTIONS
  //
  //
  // EVENTS
  //
})
