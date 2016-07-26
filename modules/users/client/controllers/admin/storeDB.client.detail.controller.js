angular.module('users.admin').controller('StoreDbDetailController', function ($scope, $location, $mdDialog,$mdMedia, locationsService, orderDataService, productGridData, $state, accountsService, CurrentUserService, Authentication, $stateParams, constants, uploadService, toastr) {

    if (Authentication.user) {
        $scope.account = {createdBy: Authentication.user.username}
    }
    $scope.orderDataService = orderDataService;
    $scope.productGridData = productGridData;
    $scope.orders = {};
    $scope.displayIndex = 0;
    $scope.checkbox = {};
    $scope.checkbox.progress= '';
    var id = $stateParams.id;
    orderDataService.getData(id).then(function(response){
        $scope.orderItems = response[0].items;
    })
    $scope.searchLimit = 15;

    $scope.showMore = function () {
        $scope.searchLimit += 15;
    };
    $scope.searchSku = function (sku) {
        orderDataService.searchSku(sku).then(function(data){
            $scope.products = data;
        })
    };
    $scope.markAsNew = function (prod){

        orderDataService.createNewProduct(prod).then(function(data){
            toastr.success('New Product Created')
            $scope.displayIndex += 1;
        })
    }
    $scope.markDuplicate = function (prod, selected){

        orderDataService.markDuplicate(prod, selected).then(function(data){
            toastr.success('Products Merged')
            $scope.displayIndex += 1;
        })
    }
    $scope.updateFilter = function (value) {

        $scope.checked = false;
        for(var i in $scope.filter){
            if($scope.filter[i].type == value.type) {
                $scope.filter.splice(i, 1);
                $scope.checked = true;
            }
        }
        if(!$scope.checked){
            $scope.filter.push(value)
        }
        console.log($scope.filter)
    }

    $scope.searchProducts = function (searchText) {
        $scope.loadingData = true;



        productGridData.searchProducts(searchText, {'status':$scope.checkbox.progress, 'types':$scope.filter}).then(function (data) {
            $scope.loadingData = false;
            $scope.products = data;


        })
    };



});
