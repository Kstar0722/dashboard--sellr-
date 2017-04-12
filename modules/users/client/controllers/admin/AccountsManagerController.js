angular.module('core').controller('AccountsManagerController', function ($scope, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, UsStates, $mdDialog, $timeout, $httpParamSerializer, $rootScope, globalClickEventName) {
  //
  // DEFINITIONS - INITIALIZATION
  //
  $scope.ui = {}
  $scope.ui.display = 'fulltable'
  $scope.ui.sortExpression = '+name'
  accountsService.init({ expand: 'stores,stats' })
  $scope.accountsService = accountsService
  $scope.ui.actionsOptionsSelect = []
  $scope.UsStates = UsStates
  $scope.ui.currentAccount = {}

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

  $scope.openEditAccountSidebar = function (account) {
    $scope.ui.currentAccount = account
    $scope.ui.display = 'editAccount'
  }

  $scope.setUsState = function (state) {
    $scope.ui.currentAccount.state = state.abbreviation
    $scope.ui.currentAccount.stateName = state.name
    $scope.ui.stateError = false
  }

  $scope.saveAccount = function (view) {
    // Unfortunately we need to treat custom select boxes errors separately
    if (!$scope.ui.currentAccount.state) {
      $scope.ui.stateError = true
    } else {
      $scope.ui.stateError = false
    }
    // If form invalid set all controls to touched to show input border
    if ($scope.accountForm.$invalid) {
      angular.forEach($scope.accountForm.$error, function (field) {
        angular.forEach(field, function (errorField) {
          errorField.$setTouched()
        })
      })
    }
    if ($scope.ui.currentAccount.state && $scope.accountForm.$valid) {
      var accountPayload = angular.copy($scope.currentAccount)
      delete accountPayload.stateName
      if (view === 'createAccount') {
        console.log(accountPayload)
        //
        // TO BE REVIEWED THIS OLD LOGIC MAY CHANGE
        //
        // accountsService.createAccount(accountPayload).then(function (newAccount) {
        //   var newAccountToEdit = _.findWhere(accountsService.accounts, {accountId: newAccount.accountId})
        //   if (newAccountToEdit) $scope.editAccount(newAccountToEdit)
        // })
      }
    }
  }

  $scope.showManageStoresDialog = function (ev) {
    $mdDialog.show({
      templateUrl: '/modules/users/client/views/admin/manageStoreDialog.html',
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
    $mdDialog.hide()
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
