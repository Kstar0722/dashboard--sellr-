angular.module('core')
.controller('NavController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state', '$stateParams', 'accountsService', 'constants', 'authenticationService', function ($scope, Authentication, Menus, $http, $window, $state, $stateParams, accountsService, constants, authenticationService) {
  $scope.ui = {}
  $scope.Authentication = Authentication
  $scope.accountsService = accountsService
  $scope.logout = function () {
    authenticationService.signout()
  }

  $scope.accountChangeHandler = function () {
    $scope.$root.selectAccountId = accountsService.currentAccount.accountId
    localStorage.setItem('accountId', accountsService.currentAccount.accountId)
  }

  $scope.shouldRenderPrimaryItem = function (item) {
    switch (item) {
      case 'admin':
        return Authentication.userInRole('admin')
      default:
        return true
    }
  }

  $scope.$root.$on('$stateChangeSuccess', function (e, toState, toParams) {
    init()
    if (!toState.name.match(/^(dashboard|storeOwner.orders|manager.ads|settings|editProfile|productsUploader|websiteBuilder)/i)) {
      $scope.$root.selectAccountId = null
    } else if (toState) {
      toParams.accountId = $scope.$root.selectAccountId
      $state.go(toState.name, toParams, {notify: false})
    }
    setActiveRoute(toState.name)
    $scope.ui.shouldRenderNav = !toState.public
  })

  $scope.$watch('$root.selectAccountId', function (accountId) {
    $stateParams.accountId = accountId
    if (accountId && $state.current.name) $state.go('.', $stateParams, {notify: false})
  })

  function setActiveRoute (state) {
    if (state.indexOf('supplier') > -1) { $scope.ui.primaryRoute = 'supplier' }
    if (state.indexOf('admin') > -1) { $scope.ui.primaryRoute = 'admin' }
    if (state.indexOf('editor') > -1 || _.contains(['productHistory', 'curator.store'], state)) { $scope.ui.primaryRoute = 'editor' }
    if (_.contains(['dashboard', 'productsUploader', 'websiteBuilder', 'manager.ads', 'storeOwner.orders'], state)) { $scope.ui.primaryRoute = 'store' }
  }

  function init () {
    if ($stateParams.accountId) {
      $scope.$root.selectAccountId = $stateParams.accountId
    } else {
      $scope.$root.selectAccountId = $scope.$root.selectAccountId || localStorage.getItem('accountId')
    }
    if ($scope.$root.selectAccountId) {
      $scope.$root.selectAccountId = parseInt($scope.$root.selectAccountId, 10) || $scope.$root.selectAccountId
    }
  }

  init()
}])
