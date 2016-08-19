/* globals angular*/
angular.module('users.admin').controller('AccountManagerController', function ($scope, locationsService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr) {
  accountsService.init()
  $scope.accountsService = accountsService
  $scope.determinateValue = 0
  $scope.accountLogo = ''
  $scope.account = {
    createdBy: ''
  }
  if (Authentication.user) {
    $scope.account.createdBy = Authentication.user.username
  }
  console.log($scope.account)

  // changes the view, and sets current edit account
  $scope.editAccount = function (account) {
    console.log('editing account %O', account)
    $scope.currentAccountLogo = ''
    accountsService.editAccount = account
    accountsService.editAccount.shoppr = Boolean(JSON.parse(account.preferences).shoppr)
    console.log('editAccount is now %O', accountsService.editAccount)
    $state.go('admin.accounts.edit', { id: account.accountId })
    window.scrollTo(0, 0)
  }

  $scope.upload = function (files, accountId) {
    var mediaConfig = {
      mediaRoute: 'media',
      folder: 'logo',
      type: 'LOGO',
      accountId: accountId
    }
    uploadService.upload(files[ 0 ], mediaConfig).then(function (response, err) {
      if (response) {
        accountsService.editAccount.logo = constants.ADS_URL + 'logo/' + response[ 0 ].mediaAssetId + '-' + response[ 0 ].fileName
        $scope.currentAccountLogo = accountsService.editAccount.logo
        toastr.success('Logo Updated', 'Success!')
      }
    })
  };

  $scope.uploadGraphic = function (files, accountId) {
    var mediaConfig = {
      mediaRoute: 'media',
      folder: 'logo',
      type: 'LOGO',
      accountId: accountId
    };

    uploadService.upload(files[ 0 ], mediaConfig).then(function (response, err) {
      if (response) {
        accountsService.editAccount.storeImg = constants.ADS_URL + 'logo/' + response[ 0 ].mediaAssetId + '-' + response[ 0 ].fileName;
        $scope.currentAccountStoreImg = accountsService.editAccount.storeImg;
        toastr.success('Logo Updated', 'Success!');
      }
    })
  };

})
