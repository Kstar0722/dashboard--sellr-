angular.module('core').controller('AccountsManagerController', function ($scope, accountsService, uploadService, toastr, UsStates, $mdDialog, $rootScope, globalClickEventName, $q, storesService, utilsService, $httpParamSerializer, $http, constants) {
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
  var confirmationDialogOptions = {
    templateUrl: '/modules/core/client/views/popupDialogs/confirmationDialog.html',
    autoWrap: true,
    parent: angular.element(document.body),
    scope: $scope,
    preserveScope: true,
    hasBackdrop: true,
    clickOutsideToClose: true,
    escapeToClose: true,
    fullscreen: true
  }

  //
  // INITIALIZATION
  //
  accountsService.init({ expand: 'stores,stats' })
  loadCardkitThemes().then(function (themes) {
    $scope.websiteThemes = themes
  })

  //
  // SCOPE FUNCTIONS
  //
  $scope.uploadLogo = function (files) {
    if (_.isEmpty(files)) {
      return
    }
    $scope.ui.tempLogo = files[0]
  }

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  $scope.showDeleteAccountDialog = function (ev) {
    $scope.genericDialog = {}
    $scope.genericDialog.title = 'Delete Account'
    $scope.genericDialog.body = 'Are you sure you want to delete this Account?'
    $scope.genericDialog.actionText = 'Delete Account'
    $scope.genericDialog.actionClass = 'common-btn-negative'
    $scope.genericDialog.action = function () {
      accountsService.deleteAccountFOREVER($scope.ui.currentAccount).then(function (response) {
        $scope.closeDialog()
        $scope.ui.display = 'fulltable'
        $scope.ui.activeIndex = null
      }, function (error) {
        console.log(error)
        toastr.error('There was a problem deleting this account')
        $scope.closeDialog()
      })
    }
    $mdDialog.show(confirmationDialogOptions)
  }

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
    $scope.ui.currentAccount.preferences = {}
    $scope.ui.display = 'createAccount'
  }

  $scope.getNewAuthCode = function (formValid) {
    accountsService.generateAuthCode($scope.ui.currentAccount).then(function (response) {
      toastr.success('New authentication code was generated successfully')
      $scope.ui.currentAccount.authCode = response.data.authCode
    }, function () {
      toastr.error('There was a problem generating a new Auth Code')
    })
  }

  $scope.submitAccount = function (formValid) {
    if (!formValid) {
      setFieldsTouched($scope.accountForm.$error)
      return false
    }

    if ($scope.ui.display === 'createAccount') {
      accountsService.createAccount($scope.ui.currentAccount).then(function (response) {
        // SAVE ACCOUNTID FOR LOGO CREATION
        $scope.ui.currentAccount.accountId = response.accountId
        saveLogo().then(function (response) {
          $scope.reOrderList('accountId')
          $scope.reOrderList('accountId')
          var newAccountIndex = _.findIndex(accountsService.accounts, { accountId: $scope.ui.currentAccount.accountId })
          $scope.ui.activeIndex = 0
          // Save new Logo only if it was uploaded first
          if (response) {
            accountsService.accounts[newAccountIndex].preferences.logo = response.publicUrl
          }
          $scope.ui.display = 'fulltable'
        })
      })
    }
    if ($scope.ui.display === 'editAccount') {
      saveLogo().then(function (response) {
        if (response) {
          $scope.ui.currentAccount.preferences.logo = response.publicUrl
        }
        accountsService.updateAccount($scope.ui.currentAccount).then(function () {
          $scope.ui.display = 'fulltable'
          $scope.ui.activeIndex = null
        })
      })
    }
  }

  $scope.openEditAccountSidebar = function (account, index) {
    $scope.ui.activeIndex = index
    $scope.ui.currentAccount = account
    $scope.ui.tempLogo = null
    console.log(account)
    $scope.ui.display = 'editAccount'
  }

  $scope.removeLogo = function () {
    $scope.ui.tempLogo = null
    $scope.ui.currentAccount.preferences.logo = ''
  }

  $scope.showManageStoresDialog = function (account, ev) {
    storesService.getStores(account.accountId).then(function () {
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
    })
  }

  $scope.debouncedAutosaveAccount = utilsService.getDebouncedFuntion(autosaveAccount)

  //
  // INTERNAL FUNCTIONS
  //
  function closeMenus () {
    $scope.ui.filterOptionsSelect = false
    $scope.ui.stateOptionsSelect = false
    $scope.ui.websiteThemesOptionsSelect = false
    $scope.ui.actionsOptionsSelect = []
  }

  function autosaveAccount () {
    if ($scope.ui.display === 'editAccount' && $scope.accountForm.$valid) {
      accountsService.updateAccount(angular.copy($scope.ui.currentAccount), true).then(function () {
        utilsService.setAutosaveMessage($scope)
      })
    }
  }

  function saveLogo () {
    var defer = $q.defer()
    if (!$scope.ui.tempLogo) {
      defer.resolve()
    } else {
      var mediaConfig = {
        mediaRoute: 'media',
        folder: 'logo',
        type: 'LOGO',
        fileType: 'IMAGE',
        accountId: $scope.ui.currentAccount.accountId
      }
      uploadService.upload($scope.ui.tempLogo, mediaConfig).then(function (response) {
        defer.resolve(response)
      })
    }
    return defer.promise
  }

  function setFieldsTouched (formErrors) {
    angular.forEach(formErrors, function (field) {
      angular.forEach(field, function (errorField) {
        errorField.$setTouched()
      })
    })
  }

  function loadCardkitThemes () {
    var params = {
      exclude: ['header', 'footer', 'user', 'js', 'css', 'variables', 'site_navigation', 'navigation_card', 'rss_settings']
    }
    var url = constants.CARDKIT_URL + '/clients?' + $httpParamSerializer(params)
    return $http.get(url).then(function (response) {
      return response.data || []
    }).catch(function (err) {
      console.error(err)
      toastr.error('Failed to load website themes')
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
