angular.module('users.admin').controller('StoreDbController', function ($scope, locationsService, orderDataService, productGridData, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr) {

    if (Authentication.user) {
        $scope.account = {createdBy: Authentication.user.username}
    }

    $scope.template = 'modules/users/client/views/productEditor/productEditor.list.html'
    $scope.orders = {};
    $scope.orderItems = [];
    $scope.hello = '';
    var url = constants.BWS_API + '/choose/orders';
    $http.get(url).then(getAvailOrderSuccess, getAvailOrderError);

    function getAvailOrderSuccess(response) {
        if (response.status === 200) {
            //timeEnd('getProductList');
            $scope.orders = response.data;

        }
    }

    function getAvailOrderError(error) {
        error('getAvailOrderError %O', error)
    }
    $scope.goToMatch = function(id){
      $state.go('admin.match', {id:id})
    }


});
