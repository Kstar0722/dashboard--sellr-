/* globals angular, _ */
angular.module('users.admin').controller('AccountManagerController', function ($scope, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, UsStates) {
  accountsService.init()
  $scope.accountsService = accountsService
  $scope.determinateValue = 0
  $scope.states = UsStates
  $scope.accountLogo = ''
  $scope.account = {
    createdBy: ''
  }
  if (Authentication.user) {
    $scope.account.createdBy = Authentication.user.firstName + Authentication.user.lastName
  }
  console.log($scope.account)

  // changes the view, and sets current edit account
  $scope.editAccount = function (account) {
    console.log('editing account %O', account)
    $scope.currentAccountLogo = ''
    accountsService.editAccount = account
    console.log('editAccount is now %O', accountsService.editAccount)
    $state.go('admin.accounts.edit', { id: account.accountId })
    window.scrollTo(0, 0)
  }

  // changes the view, and sets current edit account
  $scope.createAccount = function () {
    console.log('creating account %O', $scope.account)
    accountsService.createAccount($scope.account).then(function (newAccount) {
      var newAccountToEdit = _.findWhere(accountsService.accounts, {accountId: newAccount.accountId})
      $scope.editAccount(newAccountToEdit)
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
})
