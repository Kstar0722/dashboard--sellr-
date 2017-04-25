'use strict'
/* globals angular */

angular.module('core').controller('StoreOwnerWebsiteEditorController', ['$scope', '$sce', 'constants', 'PostMessage', 'Authentication', '$state', '$stateParams', 'accountsService', '$timeout', '$window', '$rootScope',
  function ($scope, $sce, constants, PostMessage, Authentication, $state, $stateParams, accountsService, $timeout, $window, $rootScope) {
    $scope.loading = true

    PostMessage.bindTo($scope)

    accountsService.bindSelectedAccount($scope)
    $scope.$watch('selectAccountId', function (selectAccountId, prevValue) {
      if (selectAccountId === prevValue) return
      var account = _.find(accountsService.accounts, { accountId: selectAccountId })
      $stateParams.builderPath = null
      $state.go('storeOwner.websiteEditor', $stateParams, { notify: false, reload: false })
      if (account) init(account)
    })

    PostMessage.on('identify', function () {
      PostMessage.send('identifyComplete', Authentication.user)
    })

    PostMessage.on('routeChange', function (builderUrl) {
      builderUrl = builderUrl || ''

      var builderPath = builderUrl
      builderPath = builderPath.substr(builderUrl.indexOf('/'))
      builderPath = builderPath
          .replace('/pages/' + $scope.themeClient, '')
          .replace('/pages/' + (encodeURIComponent($scope.themeClient)), '')
          .replace('/pages/' + (_.buildUrl($scope.themeClient)), '')
          .replace('/pages', '')

      console.log('routeChange', builderUrl, builderPath)
      $stateParams.builderPath = builderPath
      $state.go($state.current.name, $stateParams, { notify: false, reload: false })
    })

    PostMessage.on('loaded', function (userScope) {
      $scope.loading = false
    })

    PostMessage.on('error', function (err) {
      console.log('cardkit:', err)
    })

    $scope.$watch(function () { return accountsService.accounts }, function (accounts) {
      var account = _.find(accounts, { accountId: $scope.selectAccountId })
      if (account) init(account)
    })

    function init (account) {
      $scope.loading = true
      $scope.account = account
      $scope.themeClient = account.preferences.websiteTheme || _.buildUrl(account.name)

      var cardkitRoute = '/pages/' + $scope.themeClient
      if ($stateParams.builderPath && $stateParams.builderPath !== '/') {
        cardkitRoute += $stateParams.builderPath
      }

      $scope.embedPageBuilderUrl = null // reload cardkit
      $timeout(function () {
        $scope.embedPageBuilderUrl = $sce.trustAsResourceUrl(constants.CARDKIT_URL + '/embed#!' + cardkitRoute)
        $timeout(function () {
          $rootScope.sender = $window.frames['cardkit']
        })
      })
    }
  }
])
