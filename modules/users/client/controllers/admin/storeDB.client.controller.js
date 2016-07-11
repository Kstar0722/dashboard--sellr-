angular.module('users.admin').controller('StoreDbController', function ($scope, locationsService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr) {

    if (Authentication.user) {
        $scope.account = { createdBy: Authentication.user.username }
    }
    
    $scope.template='modules/users/client/views/productEditor/productEditor.list.html'


});
