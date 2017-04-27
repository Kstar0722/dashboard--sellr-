angular.module('core').controller('AccountsManagerController', function ($scope, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, UsStates, $mdDialog, $timeout, $httpParamSerializer, $rootScope, globalClickEventName) {
  //
  // DEFINITIONS
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.sortExpression = '+name'
  $scope.accountsService = accountsService
  $scope.ui.actionsOptionsSelect = []
  $scope.ui.currentAccount = {}
  $scope.stateSelectConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'abbreviation',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }
  $scope.stateSelectOptions = UsStates

  //
  // INITIALIZATION
  //
  accountsService.init({ expand: 'stores,stats' })

  //
  // SCOPE FUNCTIONS
  //
  $scope.openMenu = function (menu, index) {
    closeMenus()
    if (!_.isUndefined(index)) {
      $scope.ui[menu][index] = true
    } else {
      $scope.ui[menu] = true
    }
  }

  $scope.reOrderList = function (field) {
    var oldSort = $scope.ui.sortExpression || ''
    var asc = true
    if (oldSort.substr(1) === field) asc = oldSort[0] === '-'
    $scope.ui.sortExpression = (asc ? '+' : '-') + field
    return $scope.ui.sortExpression
  }

  $scope.openCreateAccountSidebar = function () {
    $scope.ui.currentAccount = {}
    $scope.ui.display = 'createAccount'
  }

  $scope.submitAccount = function (formValid) {
    $scope.ui.stateRequired = false
    var flag = formValid
    if (!$scope.ui.currentAccount.state) {
      $scope.ui.stateRequired = true
      flag = false
    }
    if (!flag) {
      setFieldsTouched($scope.accountForm.$error)
      return false
    }

    if ($scope.ui.display === 'createAccount') {
      accountsService.createAccount($scope.ui.currentAccount).then(function (newAccount) {
        $scope.ui.display = 'fulltable'
      })
    }
    if ($scope.ui.display === 'editAccount') {
    }
  }

  $scope.openEditAccountSidebar = function (account) {
    $scope.ui.currentAccount = account
    $scope.ui.display = 'editAccount'
  }

  $scope.showManageStoresDialog = function (ev) {
    $mdDialog.show({
      templateUrl: '/modules/core/client/views/popupDialogs/manageStoreDialog.html',
      autoWrap: true,
      parent: angular.element(document.body),
      preserveScope: false,
      hasBackdrop: true,
      clickOutsideToClose: false,
      escapeToClose: false,
      fullscreen: true,
      controller: 'StoreManagerController'
    })
  }

  //
  // INTERNAL FUNCTIONS
  //
  function closeMenus () {
    $scope.ui.filterOptionsSelect = false
    $scope.ui.stateOptionsSelect = false
    $scope.ui.websiteThemesOptionsSelect = false
    $scope.ui.actionsOptionsSelect = []
  }

  function setFieldsTouched (formErrors) {
    angular.forEach(formErrors, function (field) {
      angular.forEach(field, function (errorField) {
        errorField.$setTouched()
      })
    })
  }

  //
  // EVENTS
  //
  var unregisterGlobalClick = $rootScope.$on(globalClickEventName, function (event, targetElement) {
    if (targetElement.className.indexOf('ignore-click-trigger') === -1) {
      $scope.$apply(function () {
        closeMenus()
      })
    }
  })

  // MANDATORY to prevent Leak
  $scope.$on('$destroy', unregisterGlobalClick)
})
