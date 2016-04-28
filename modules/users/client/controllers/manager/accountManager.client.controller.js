angular.module('users.manager').controller('AccountManagerController', function ($scope, locationsService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr) {
    accountsService.init();
    $scope.accountsService = accountsService;

    $scope.determinateValue = 0;
    $scope.accountLogo = '';
    $scope.account = {
        createdBy: Authentication.user.username
    };
    console.log($scope.account);

    //changes the view, and sets current edit account
    $scope.editAccount = function (account) {
        console.log('editing account %O', account)
        $scope.currentAccountLogo = '';
        accountsService.editAccount = account;
        accountsService.editAccount.style = JSON.parse(account.preferences).style
        console.log('editAccount is now %O', accountsService.editAccount)
        $state.go('manager.accounts.edit', {id: account.accountId})
    }


    $scope.upload = function (files, accountId) {
        var mediaConfig = {
            mediaRoute: 'media',
            folder:'logo',
            type:'LOGO',
            accountId: accountId
        }
        uploadService.upload(files, mediaConfig).then(function(response, err ){
            if(response) {
                accountsService.editAccount.logo = constants.ADS_URL + 'logo/'+response.mediaAssetId + '-' + response.fileName;
                $scope.currentAccountLogo = accountsService.editAccount.logo;
                toastr.success('Logo Updated', 'Success!');
            }
        })
    };

});
