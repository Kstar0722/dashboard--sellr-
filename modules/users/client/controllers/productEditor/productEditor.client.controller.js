angular.module('users').controller('productEditorController', function ($scope, Authentication, productEditorService, $location, $state, $stateParams, Countries, $mdMenu) {
    // productEditorService.init();
    $scope.$state = $state;
    $scope.pes = productEditorService;
    $scope.userId = Authentication.userId || localStorage.getItem('userId') || 407;
    $scope.detail = {
        template: 'modules/users/client/views/productEditor/productEditor.detail.html'
    };
    $scope.permissions = {
        editor: Authentication.user.roles.indexOf('editor') > -1 || Authentication.user.roles.indexOf('admin') > -1,
        curator: Authentication.user.roles.indexOf('curator') > -1 || Authentication.user.roles.indexOf('admin') > -1
    };

    $scope.Countries = Countries.allCountries;
    $scope.selectProductType = function (type) {
        productEditorService.currentType = type;
        productEditorService.currentStatus = productEditorService.productStatuses[ 0 ];
        // $state.go('editor.products', { type: type.name });
        productEditorService.updateProductList()
    };
    function setState() {
        var type;
        switch ($stateParams.type) {
            case 'wine':
                type = { name: 'wine', productTypeId: 1 };
                break;
            case 'beer':
                type = { name: 'beer', productTypeId: 2 };
                break;
            case 'spirits':
                type = { name: 'spirits', productTypeId: 3 };
                break;
        }
        $scope.selectProductType(type);

    }

    setState();

    $scope.selectProductStatus = function (status) {
        productEditorService.currentStatus = status;
        productEditorService.updateProductList()
    };

    $scope.claimProduct = function (prod) {
        var options = {
            userId: 407,
            productId: prod.productId
        };
        productEditorService.claim(options)
    }

    $scope.viewProduct = function (product) {
        productEditorService.setCurrentProduct(product);
        $state.go('editor.products.detail', { productId: product.productId, task: 'view' });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.view.html'
    };
    $scope.editProduct = function (product) {
        productEditorService.setCurrentProduct(product);
        $state.go('editor.products.detail', { productId: product.productId, task: 'edit' });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.edit.html'
    };

    $scope.sendBack = function (feedback) {
        //send product back to be edited again
    };

    $scope.submitForApproval = function (prod) {
        productEditorService.finishProduct(prod);
        $scope.viewProduct(prod)


    };

    $scope.approveProduct = function (prod) {
        productEditorService.approveProduct(prod);
        //    TODO:redirect to view screen
    };

    $scope.unsubmitProduct = function (prod) {
        //save automatically updates status to 'inprogress'
        productEditorService.saveProduct(prod)
    };

    $scope.updateProduct = function (prod) {
        productEditorService.saveProduct(prod)
    };


    $scope.playAudio = function () {
        productEditorService.currentProduct.audio.play()
    };
    $scope.pauseAudio = function () {
        productEditorService.currentProduct.audio.pause()
    };
    $scope.seekAudio = function () {
        productEditorService.currentProduct.audio.currentTime = productEditorService.currentProduct.audio.progress * productEditorService.currentProduct.audio.duration

    }


});
