angular.module('users').controller('productEditorController', function ($scope, Authentication, productEditorService, $location, $state, $stateParams, Countries) {
    productEditorService.init();
    $scope.pes = productEditorService;
    $scope.userId = Authentication.userId || localStorage.getItem('userId');
    $scope.detail = {
        template: 'modules/users/client/views/productEditor/productEditor.detail.html'
    };
    $scope.permissions = {
        editor: Authentication.user.roles.indexOf('editor') > -1,
        curator: Authentication.user.roles.indexOf('curator') > -1
    };

    $scope.Countries = Countries.allCountries;
    $scope.selectProductType = function (type) {
        productEditorService.currentType = type;
        productEditorService.currentStatus = productEditorService.productStatuses[ 0 ];
        $state.go('editor.products', { type: type.name });
        productEditorService.updateProductList()
    };

    $scope.selectProductStatus = function (status) {
        productEditorService.currentStatus = status;
        productEditorService.updateProductList()
    };

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
        productEditorService.finishProduct(prod)
        //    TODO:redirect to view screen

    };

    $scope.approveProduct = function (prod) {
        productEditorService.approveProduct(prod)
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
    }
    $scope.pauseAudio = function () {
        productEditorService.currentProduct.audio.pause()
    }
    $scope.seekAudio = function () {
        productEditorService.currentProduct.audio.currentTime = productEditorService.currentProduct.audio.progress * productEditorService.currentProduct.audio.duration

    }


});
