angular.module('core')
.controller('NavController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state', '$stateParams', 'accountsService', 'constants', 'authenticationService', function ($scope, Authentication, Menus, $http, $window, $state, $stateParams, accountsService, constants, authenticationService) {
  $scope.ui = {}
  $scope.accountsService = accountsService

  $scope.signOut = function () {
    authenticationService.signout()
  }

  $scope.accountChangeHandler = function (account) {
    console.log(account)
    // $scope.$root.selectAccountId = account.accountId
    // $scope.mobileMenuActive.open = false
    // localStorage.setItem('accountId', account.accountId)
  }

  $scope.shouldRenderPrimaryItem = function (item) {
    switch (item) {
      case 'dash':
        return Authentication.userInRole('admin')
      default:
        return true
    }
  }
  $scope.shouldRenderSecondaryItem = function (item) {
    switch (item) {
      case 'dash':
        return Authentication.userInRole('admin')
      default:
        return true
    }
  }
}])
