/* globals angular, _ */
angular.module('users.admin').controller('AccountManagerController', function ($scope, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, UsStates, $mdDialog, $timeout, $httpParamSerializer) {
  accountsService.init({ expand: 'stores,stats' })
  $scope.accountsService = accountsService
  $scope.determinateValue = 0
  $scope.states = UsStates
  $scope.accountLogo = ''
  $scope.account = {
    createdBy: ''
  }
  $scope.sortExpression = '+name'
  $scope.websiteThemes = null

  $scope.openNestedDialog = function () {
    if ($scope.dialog) return
    if ($('.md-dialog-container').contents().length === 0) return
    $scope.dialog = $mdDialog.show({
      contentElement: '.md-dialog-container',
      onRemoving: $scope.cancelDialog
    })
  }

  $scope.cancelDialog = function () {
    $mdDialog.cancel($scope.dialog)
    $scope.dialog = null
    $timeout(function () { $state.go('admin.accounts') }, 500)
  }

  // changes the view, and sets current edit account
  $scope.editAccount = function (account) {
    console.log('editing account %O', account)
    $scope.currentAccountLogo = ''
    accountsService.editAccount = angular.copy(account)
    console.log('editAccount is now %O', accountsService.editAccount)
    $scope.original = { editAccount: account }
    $state.go('admin.accounts.edit', { id: account.accountId }).then(function () {
      $timeout($scope.openNestedDialog)
    })
  }

  $scope.createAccount = function () {
    $state.go('admin.accounts.create').then(function () {
      $timeout($scope.openNestedDialog)
    })
  }

  // changes the view, and sets current edit account
  $scope.saveNewAccount = function () {
    console.log('creating account %O', $scope.account)
    accountsService.createAccount($scope.account).then(function (newAccount) {
      var newAccountToEdit = _.findWhere(accountsService.accounts, {accountId: newAccount.accountId})
      if (newAccountToEdit) $scope.editAccount(newAccountToEdit)
    })
  }

  $scope.upload = function (files, accountId) {
    if (_.isEmpty(files)) {
      return
    }
    var mediaConfig = {
      mediaRoute: 'media',
      folder: 'logo',
      type: 'LOGO',
      accountId: accountId
    }
    uploadService.upload(files[ 0 ], mediaConfig).then(function (response, err) {
      if (response) {
        accountsService.editAccount.logo = constants.ADS_URL + 'logo/' + response.mediaAssetId + '-' + response.fileName
        $scope.currentAccountLogo = accountsService.editAccount.logo
        toastr.success('Logo Updated', 'Success!')
      }
    })
  }

  $scope.uploadGraphic = function (files, accountId) {
    var mediaConfig = {
      mediaRoute: 'media',
      folder: 'storeImg',
      type: 'STOREIMG',
      accountId: accountId
    }

    uploadService.upload(files[ 0 ], mediaConfig).then(function (response, err) {
      if (response) {
        accountsService.editAccount.storeImg = constants.ADS_URL + 'storeImg/' + response[ 0 ].mediaAssetId + '-' + response[ 0 ].fileName
        $scope.currentAccountStoreImg = accountsService.editAccount.storeImg
        toastr.success('Store Image Updated', 'Success!')
      }
    })
  }

  $scope.reOrderList = function (field) {
    var oldSort = $scope.sortExpression || ''
    var asc = true
    if (oldSort.substr(1) === field) asc = oldSort[0] === '-'
    $scope.sortExpression = (asc ? '+' : '-') + field
    return $scope.sortExpression
  }

  $scope.updateAccount = function (isValid) {
    if (!isValid) return
    accountsService.updateAccount().then(function () {
      $scope.cancelDialog()
    })
  }

  $scope.confirmDeleteAccount = function (account) {
    var confirm = $mdDialog.confirm()
        .title('Delete account?')
        .htmlContent('Are you sure you want to remove account <b>' + (account.storeName || account.name) + '</b>?')
        .ok('Delete')
        .cancel('Cancel')

    $mdDialog.cancel().then(function () {
      $timeout(function () {
        $('body > .md-dialog-container').addClass('delete confirm')
      })

      $mdDialog.show(confirm).then(function () {
        accountsService.deleteAccount(account).then(function () {
          $scope.cancelDialog()
        })
      })
    })
  }

  $scope.$watch('accountsService.accounts', function (accounts) {
    if (_.isEmpty(accounts)) return

    if ($scope.dialog) return

    if ($state.current.name.match(/edit$/)) {
      var account = _.find(accounts, { accountId: parseInt($state.params.id, 10) })
      if (account) $timeout(function () { $scope.editAccount(account) })
    }
    if ($state.current.name.match(/create$/)) {
      $timeout($scope.createAccount)
    }
  })

  init()

  function init () {
    if (Authentication.user) {
      $scope.account.createdBy = Authentication.user.firstName + Authentication.user.lastName
    }
    console.log($scope.account)

    loadCardkitThemes().then(function (themes) {
      $scope.websiteThemes = themes
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
})
