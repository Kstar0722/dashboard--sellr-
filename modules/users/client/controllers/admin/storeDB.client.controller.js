angular.module('users.admin').controller('StoreDbController', function ($scope, locationsService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr) {
    accountsService.init();
    $scope.accountsService = accountsService;
    $scope.determinateValue = 0;
    $scope.accountLogo = '';
    $scope.account = {
        createdBy: ''
    };
    if (Authentication.user) {
        $scope.account.createdBy = Authentication.user.username
    }
    console.log($scope.account);


});
