angular.module('core')
.controller('NavController', function ($scope, Authentication, $http, $window, $state, $stateParams, accountsService, constants, authenticationService, globalClickEventName, $rootScope, $mdDialog, PostMessage) {
  //
  // DEFINITIONS - INITIALIZATION
  //
  $scope.ui = {}
  $scope.Authentication = Authentication
  $scope.accountsService = accountsService
  connectCardkit($rootScope)
  init()

  //
  // SCOPE FUNCTIONS
  //
  $scope.logout = function () {
    authenticationService.signout()
  }

  $scope.showEditProfileDialog = function (ev) {
    $scope.ui.showAccountMenu = false
    $mdDialog.show({
      templateUrl: '/modules/core/client/views/popupDialogs/editProfileDialog.html',
      autoWrap: true,
      parent: angular.element(document.body),
      preserveScope: false,
      hasBackdrop: true,
      clickOutsideToClose: false,
      escapeToClose: false,
      fullscreen: true,
      controller: 'EditProfileController'
    })
  }

  $scope.accountChangeHandler = function (account) {
    $rootScope.selectAccountId = account.accountId
    localStorage.setItem('accountId', account.accountId)
    $scope.ui.showAccountsSelector = false
  }

  $scope.openMenu = function (menu) {
    closeMenus()
    $scope.ui[menu] = true
  }

  //
  // INTERNAL FUNCTIONS
  //
  function updateNavRendering (state) {
    // Nav Main Sections
    if (state) {
      $scope.ui.shouldRenderWholeNav = !state.public
    } else {
      // for some reason if state is not passed on page refresh then just render the nav
      $scope.ui.shouldRenderWholeNav = true
    }
    $scope.ui.shouldRenderPrimaryNav = Authentication.userInRole('supplier') || Authentication.userInRole('editor') || Authentication.userInRole('curator')
    // Nav Primary Items
    $scope.ui.shouldRenderBrandItem = Authentication.userInRole('admin')
    $scope.ui.shouldRenderSupplierItem = Authentication.userInRole('supplier')
    $scope.ui.shouldRenderAdminItem = Authentication.userInRole('admin')
    $scope.ui.shouldRenderEditorItem = Authentication.userInRole('editor') || Authentication.userInRole('curator') || Authentication.userInRole('supplier')
    $scope.ui.shouldRenderOwnerItem = Authentication.userInRole('owner')
    // Nav Secondary Items
    $scope.ui.shouldRenderSupplierStoreManagerItem = Authentication.userInRole('supplier')
    $scope.ui.shouldRenderProductEditorItem = Authentication.userInRole('editor') || Authentication.userInRole('curator')
    $scope.ui.shouldRenderProductHistoryItem = Authentication.userInRole('curator')
    $scope.ui.shouldRenderStoreManagerItem = Authentication.userInRole('curator') || Authentication.userInRole('supplier')
  }

  function setActiveRoute (state) {
    if (state.indexOf('brand') > -1) { $scope.ui.primaryRoute = 'brand' }
    if (state.indexOf('supplier') > -1) { $scope.ui.primaryRoute = 'supplier' }
    if (state.indexOf('admin') > -1) { $scope.ui.primaryRoute = 'admin' }
    if (state.indexOf('editor') > -1) { $scope.ui.primaryRoute = 'editor' }
    if (state.indexOf('storeOwner') > -1) { $scope.ui.primaryRoute = 'store' }
    if (state.indexOf('cardkit') > -1) { $scope.ui.primaryRoute = 'store' }
  }

  function init () {
    if ($stateParams.accountId) {
      $rootScope.selectAccountId = $stateParams.accountId
    } else {
      $rootScope.selectAccountId = $rootScope.selectAccountId || localStorage.getItem('accountId')
    }
    if ($rootScope.selectAccountId) {
      $rootScope.selectAccountId = parseInt($rootScope.selectAccountId, 10) || $rootScope.selectAccountId
    }
  }

  function closeMenus () {
    $scope.ui.accountOptionsSelect = false
    $scope.ui.profileOptionsSelect = false
  }

  //
  // EVENTS
  //
  $scope.$watch('$root.selectAccountId', function (accountId) {
    $stateParams.accountId = accountId
    if (accountId && $state.current.name) $state.go('.', $stateParams, {notify: false})
  })

  $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams) {
    init()
    if (toState) {
      toParams.accountId = $rootScope.selectAccountId
      $state.go(toState.name, toParams, {notify: false})
    }
    setActiveRoute(toState.name)
    updateNavRendering(toState)
  })

  var unregisterGlobalClick = $rootScope.$on(globalClickEventName, function (event, targetElement) {
    var excludedElementsId = ['account-search-input']
    if (!_.contains(excludedElementsId, targetElement.id) && targetElement.className.indexOf('menu-select-trigger') === -1) {
      closeMenus()
      if (!$scope.$$phase) $scope.$digest()
    }
  })
  // Sort of not needed because Nav Scope will never be destroyed but this is mandatory elsewhere to prevent Leak
  $scope.$on('$destroy', unregisterGlobalClick)

  function connectCardkit ($scope) {
    PostMessage.on('identify', function () {
      PostMessage.send('identifyComplete', Authentication.user)
    })

    $scope.$watch('selectAccountId', selectAccount)
    $scope.$watch(function () { return accountsService.accounts }, selectAccount)

    function selectAccount () {
      var account = _.find(accountsService.accounts, { accountId: $scope.selectAccountId })
      if (account) $rootScope.selectAccount = account
    }
  }
})
