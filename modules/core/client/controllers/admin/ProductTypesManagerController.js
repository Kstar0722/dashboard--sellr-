angular.module('core').controller('ProductTypesManagerController', function ($scope, $state, toastr) {
  $scope.hardcodedTypesData =
  [
    {
      name: 'Spirit',
      industry: 'Beverage',
      image: '/img/beer_grey_placeholder.png',
      fields: [
        {
          type: 'Text Input',
          label: 'label example',
          instructions: 'instructions example',
          ownercanedit: false,
          editorcanedit: false,
          selectOptions: ''
        },
        {
          type: 'List',
          label: 'list label example',
          instructions: 'list instructions example',
          ownercanedit: false,
          editorcanedit: false,
          selectOptions: ''
        },
        {
          type: 'Select Dropdown',
          label: 'select lbl example',
          instructions: 'select inst. example',
          ownercanedit: false,
          editorcanedit: false,
          selectOptions: 'option1, option2, option3'
        }
      ]
    },
    {
      name: 'Wine',
      industry: 'Beverage',
      image: '/img/beer_grey_placeholder.png',
      fields: [
        {
          type: 'Text Input',
          label: 'Wine Label',
          instructions: 'Wine instructions',
          ownercanedit: true,
          editorcanedit: true,
          selectOptions: ''
        }
      ]
    },
    {
      name: 'Atron++',
      industry: 'Pharmacy',
      image: '/img/beer_grey_placeholder.png',
      fields: [
        {
          type: 'Text Input',
          label: 'Pharmaco Label',
          instructions: 'Pharmaco instructions',
          ownercanedit: false,
          editorcanedit: true,
          selectOptions: ''
        }
      ]
    }
  ]

  //
  // DEFINITIONS
  //
  $scope.ui = {}
  $scope.ui.activeType = null
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
  var defaultTypeField = {
    type: 'Text Input',
    label: '',
    instructions: '',
    ownercanedit: false,
    editorcanedit: false,
    selectOptions: ''
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
  $scope.industryTypesConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'value',
    labelField: 'name',
    sortField: 'name',
    searchField: ['name']
  }

  //
  // INITIALIZATION
  //
  var industriesTemp = _.pluck($scope.hardcodedTypesData, 'industry')
  industriesTemp = _.uniq(industriesTemp)
  industriesTemp = _.map(industriesTemp, function (industry) { return {name: industry, value: industry} })
  industriesTemp.unshift({name: 'All Industries', value: ''})
  $scope.industryTypes = industriesTemp
  $scope.ui.industryFilter = ''

  //
  // SCOPE FUNCTIONS
  //
  $scope.addTypeField = function () {
    $scope.ui.activeType.fields.push(angular.copy(defaultTypeField))
  }

  $scope.addNewType = function () {
    $scope.hardcodedTypesData.push(angular.copy(defaultType))
    $scope.ui.activeType = $scope.hardcodedTypesData[$scope.hardcodedTypesData.length - 1]
  }

  //
  // INTERNAL FUNCTIONS
  //
  //
  // EVENTS
  //
})
