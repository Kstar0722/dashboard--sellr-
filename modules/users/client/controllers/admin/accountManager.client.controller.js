/* globals angular, _ */
angular.module('users.admin').controller('AccountManagerController', function ($scope, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr, UsStates, $mdDialog, $timeout) {
  accountsService.init({ expand: 'stores,stats' })
  $scope.accountsService = accountsService
  $scope.determinateValue = 0
  $scope.states = UsStates
  $scope.accountLogo = ''
  $scope.account = {
    createdBy: ''
  }
  $scope.sortExpression = '+name';

  $scope.openNestedDialog = function() {
    $scope.dialog = $mdDialog.show({
      contentElement: '.md-dialog-container',
      onRemoving: $scope.cancelDialog,
      focusOnOpen: false
    });
  };

  $scope.cancelDialog = function () {
    $mdDialog.cancel();
    $scope.dialog = null;
    $timeout(function() { $state.go('admin.accounts'); }, 400);
  };

  // changes the view, and sets current edit account
  $scope.editAccount = function (account) {
    console.log('editing account %O', account)
    $scope.currentAccountLogo = ''
    accountsService.editAccount = account
    console.log('editAccount is now %O', accountsService.editAccount)
    $state.go('admin.accounts.edit', { id: account.accountId })
    $scope.editAccountOriginal = { account: angular.copy(accountsService.editAccount) };
    $timeout($scope.openNestedDialog, 100);
  }

  $scope.createAccount = function () {
    $state.go('admin.accounts.create');
    $timeout($scope.openNestedDialog, 100);
  };

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
    var oldSort = $scope.sortExpression || '';
    var asc = true;
    if (oldSort.substr(1) == field) asc = oldSort[0] == '-';
    return $scope.sortExpression = (asc ? '+' : '-') + field;
  };

  $scope.$watch('accountsService.accounts', function (accounts) {
    if (_.isEmpty(accounts)) return;

    if ($scope.dialog) return;
    $scope.dialog = true;

    if ($state.current.name.match(/edit$/)) {
      var account = _.find(accounts, { accountId: parseInt($state.params.id, 10) });
      if (account) $timeout(function() { $scope.editAccount(account); })
    }
    if ($state.current.name.match(/create$/)) {
      $timeout($scope.createAccount);
    }
  });

  init();

  function init() {
    if (Authentication.user) {
      $scope.account.createdBy = Authentication.user.firstName + Authentication.user.lastName
    }
    console.log($scope.account)
  }
})
