angular.module('core')
.controller('NavController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state', '$stateParams', 'accountsService', 'constants', 'authenticationService', function ($scope, Authentication, Menus, $http, $window, $state, $stateParams, accountsService, constants, authenticationService) {
  $scope.ui = {}
  $scope.ui.accountOptionsLabel = Authentication.user.displayName

  $scope.accountsService = accountsService

  $scope.signOut = function () {
    authenticationService.signout()
  }

  $scope.accountChangeHandler = function (account) {
    $scope.$root.selectAccountId = account.accountId
    localStorage.setItem('accountId', account.accountId)
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
    if (!toState.name.match(/^(dashboard|storeOwner.orders|manager.ads|settings|editProfile|productsUploader|websiteBuilder)/i)) {
      $scope.$root.selectAccountId = null
    } else if (toState) {
      toParams.accountId = $scope.$root.selectAccountId
      $state.go(toState.name, toParams, {notify: false})
    }
    setActiveRoute(toState.name)
  })

  function setActiveRoute (state) {
    if (state.indexOf('supplier') > -1) { $scope.ui.primaryRoute = 'supplier' }
    if (state.indexOf('admin') > -1) { $scope.ui.primaryRoute = 'admin' }
    if (state.indexOf('editor') > -1 || _.contains(['productHistory', 'curator.store'], state)) { $scope.ui.primaryRoute = 'editor' }
    if (_.contains(['dashboard', 'productsUploader', 'websiteBuilder', 'manager.ads', 'storeOwner.orders'], state)) { $scope.ui.primaryRoute = 'store' }
  }
}])
