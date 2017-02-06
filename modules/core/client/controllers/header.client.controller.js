'use strict'
/* globals angular, moment, _, localStorage */
angular.module('core').controller('HeaderController', [ '$scope', 'Authentication', 'Menus', '$http', '$window', '$state', '$stateParams', 'accountsService', 'constants', 'authenticationService',
  function ($scope, Authentication, Menus, $http, $window, $state, $stateParams, accountsService, constants, authenticationService) {
    var API_URL = constants.API_URL
    $scope.authentication = Authentication
    $scope.ui = {}
    $scope.$state = $state
    $scope.accountsService = accountsService
    $scope.renderMenu = true
    $scope.renderTopMenu = true
    $scope.mobileMenuActive = {}
    $scope.mobileMenuActive.open = false

    $scope.changeAccount = function (account) {
      $scope.$root.selectAccountId = account.accountId
      $scope.mobileMenuActive.open = false
      localStorage.setItem('accountId', account.accountId)
    }

    $scope.isCollapsed = false
    $scope.mainMenu = Menus.getMenu('main')
    $scope.menu = Menus.getMenu('topbar')
    $scope.editorMenu = Menus.getMenu('editor')
    console.log('editor Menu %O', $scope.editorMenu)
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed
    }
    $scope.openMenu = function ($mdOpenMenu, ev) {
      $mdOpenMenu(ev)
    }
    $scope.editProfile = function () {
      $state.go('editProfile')
    }
    $scope.signOut = function () {
      authenticationService.signout()
    }

    $scope.changeAccount = function (account) {
      $scope.$root.selectAccountId = account.accountId
      $scope.mobileMenuActive.open = false
      localStorage.setItem('accountId', account.accountId)
    }

    $scope.closeDropdown = function (e) {
      setTimeout(function () {
        $('body > md-backdrop').click()
      })
    }

    $scope.$watch('authentication.user', function (user) {
      updateMenuVisibility()
    })

    $scope.$watch('$root.selectAccountId', function (accountId) {
      updateMenuVisibility()
      updateOrdersCount()
    })

    $scope.$watch('$root.selectAccountId', function (accountId) {
      $stateParams.accountId = accountId
      if (accountId && $state.current.name) $state.go('.', $stateParams, {notify: false})
    })

    $scope.$root.$on('$stateChangeSuccess', function (e, toState, toParams) {
      init()
      updateMenuVisibility()

      if (!toState.name.match(/^(dashboard|storeOwner.orders|manager.ads|settings|editProfile|productsUploader|websiteBuilder)/i)) {
        $scope.$root.selectAccountId = null
      } else if (toState) {
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

      if ($scope.$root.selectAccountId) {
        $scope.$root.selectAccountId = parseInt($scope.$root.selectAccountId, 10) || $scope.$root.selectAccountId
      }
    }

    function shouldRenderMenu (menu, user) {
      user = user || $scope.authentication.user
      var result = _.some(menu.items, function (item) { return item.shouldRender(user) })
      return result
    }

    function updateMenuVisibility () {
      var user = $scope.authentication.user
      var accountId = $scope.$root.selectAccountId
      $scope.$root.renderMenu = !$state.current.public && !$state.is('getStarted')
      if ($scope.$root.renderMenu) {
        $scope.renderTopMenu = shouldRenderMenu($scope.menu, user) || !accountId
      }
      $scope.$root.renderTopMenu = $scope.renderTopMenu
    }
  }
])
