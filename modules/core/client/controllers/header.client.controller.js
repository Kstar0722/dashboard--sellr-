'use strict'
/* globals angular, moment, _, localStorage */
angular.module('core').controller('HeaderController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state', '$stateParams', 'accountsService', 'constants', function ($scope, Authentication, Menus, $http, $window, $state, $stateParams, accountsService, constants) {
  var API_URL = constants.API_URL
  $scope.authentication = Authentication
  $scope.ui = {}
  $scope.$state = $state
  $scope.accountsService = accountsService
  $scope.renderTopMenu = true

  var originatorEv
  $scope.isCollapsed = false
  $scope.mainMenu = Menus.getMenu('main')
  $scope.menu = Menus.getMenu('topbar')
  $scope.editorMenu = Menus.getMenu('editor')
  console.log('editor Menu %O', $scope.editorMenu)
  $scope.toggleCollapsibleMenu = function () {
    $scope.isCollapsed = !$scope.isCollapsed
  }
  $scope.openMenu = function ($mdOpenMenu, ev) {
    originatorEv = ev
    $mdOpenMenu(ev)
  }
  $scope.signOut = function () {
    window.localStorage.clear()
    localStorage.clear()
    $window.localStorage.clear()
    $window.location.href = '/'
  }

  $scope.closeDropdown = function (e) {
    setTimeout(function() {
      $('body > md-backdrop').click();
    });
  };

  $scope.$watch('authentication.user', function (user) {
    updateMenuVisibility(user, $scope.$root.selectAccountId)
  })

  $scope.$watch('$root.selectAccountId', function (accountId) {
    updateMenuVisibility($scope.authentication.user, accountId)
    updateOrdersCount()
  })

  $scope.$watch('$root.selectAccountId', function (accountId) {
    $stateParams.accountId = accountId
    if (accountId && $state.current.name) $state.go('.', $stateParams, {notify: false})
  })

  $scope.$root.$on('$stateChangeSuccess', function (e, toState, toParams) {
    init()

    if (toState.name !== 'dashboard' && toState.name !== 'storeOwner.orders' && toState.name !== 'manager.ads') {
      $scope.$root.selectAccountId = null
    }
    else if (toState) {
      toParams.accountId = $scope.$root.selectAccountId
      $state.go(toState.name, toParams, {notify: false})
    }
  })

  init()

  //
  // PRIVATE FUNCTIONS
  //

  function updateOrdersCount () {
    if ($scope.$root.selectAccountId && $scope.$root.selectAccountId !== null && $scope.$root.renderTopMenu) {
      console.log('called')
      var ordersUrl = API_URL + '/mobile/reservations/store/' + $scope.$root.selectAccountId
      $http.get(ordersUrl).then(function (response) {
        accountsService.ordersCount = _.filter(response.data, function (order) { return moment().isSame(order.pickupTime, 'day') && order.status !== 'Completed' && order.status !== 'Cancelled' }).length
      })
    }
  }

  function init () {
    if ($stateParams.accountId) {
      $scope.$root.selectAccountId = $stateParams.accountId
    } else {
      $scope.$root.selectAccountId = $scope.$root.selectAccountId || localStorage.getItem('accountId')
    }
  }

  function shouldRenderMenu (menu, user) {
    user = user || $scope.authentication.user
    var result = _.some(menu.items, function (item) { return item.shouldRender(user); })
    return result
  }

  function updateMenuVisibility (user, accountId) {
    $scope.renderTopMenu = shouldRenderMenu($scope.menu, user) || !accountId
    $scope.$root.renderTopMenu = $scope.renderTopMenu
  }
}
])
