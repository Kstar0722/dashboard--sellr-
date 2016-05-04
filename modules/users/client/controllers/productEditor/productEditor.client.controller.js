angular.module('users').controller('productEditorController', function ($scope, Authentication, productEditorService, $location, $state, $stateParams, Countries, $mdMenu, constants) {

    $scope.$state = $state;
    $scope.pes = productEditorService;
    // $scope.userId = Authentication.userId || localStorage.getItem('userId') || 407;
    $scope.userId = localStorage.getItem('userId');
    $scope.detail = {
        template: 'modules/users/client/views/productEditor/productEditor.detail.html'
    };
    $scope.permissions = {
        editor: Authentication.user.roles.indexOf('editor') > -1 || Authentication.user.roles.indexOf('admin') > -1,
        curator: Authentication.user.roles.indexOf('curator') > -1 || Authentication.user.roles.indexOf('admin') > -1
    };

    $scope.search = {};
    $scope.searchLimit = 15;

    $scope.showMore = function () {
        $scope.searchLimit += 15;
        socket.send({ message: 'hello world' })
    };


    $scope.Countries = Countries.allCountries;
    $scope.selectProductType = function (type) {
        productEditorService.currentType = type;
        $state.go('editor.products', { type: type.name, status: productEditorService.currentStatus.value });
        productEditorService.updateProductList()
    };

    $scope.selectProductStatus = function (status) {
        productEditorService.currentStatus = status;
        productEditorService.updateProductList()
    };
    function init() {
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
        var status;
        switch ($stateParams.status) {
            case 'new':
                status = { name: 'Available', value: 'new' };
                break;
            case 'inprogress':
                status = { name: 'In Progress', value: 'inprogress' };
                break;
            case 'done':
                status = { name: 'Done', value: 'done' };
                break;
            case 'approved':
                status = { name: 'Approved', value: 'approved' };
                break;
        }

        productEditorService.currentType = type;
        productEditorService.currentStatus = status;
        productEditorService.updateProductList();
        if ($stateParams.productId) {
            if ($stateParams.task === 'view') {
                $scope.viewProduct($stateParams)
            }
            if ($stateParams.task === 'edit') {
                $scope.editProduct($stateParams)
            }
        }
    }

    $scope.claimProduct = function (prod) {
        var options = {
            userId: $scope.userId,
            productId: prod.productId
        };
        productEditorService.claim(options);
        var i = _.findIndex(productEditorService.productList, function (p) {
            return p.productId === prod.productId
        });

        productEditorService.productList[ i ].username = Authentication.user.username;
        productEditorService.productList[ i ].userId = $scope.userId;
        // $scope.editProduct(prod)
    };

    $scope.removeClaim = function (product, i) {
        var options = {
            userId: $scope.userId,
            productId: product.productId
        };
        productEditorService.removeClaim(options);
        productEditorService.productList[ i ].username = null;
        productEditorService.productList[ i ].userId = null;
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.html'
    }

    $scope.viewProduct = function (product) {
        productEditorService.setCurrentProduct(product);
        $state.go('editor.products.detail', { productId: product.productId, task: 'view' });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.view.html'
    };
    $scope.editProduct = function (product) {
        productEditorService.setCurrentProduct(product);
        productEditorService.currentStatus = { name: 'In Progress', value: 'inprogress' };
        console.log('editProduct sees type as ', productEditorService.currentType.name)
        $state.go('editor.products.detail', {
            type: productEditorService.currentType.name,
            status: 'inprogress',
            productId: product.productId,
            task: 'edit'
        });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.edit.html'
    };

    $scope.sendBack = function (prod, feedback) {
        prod.description += '<br>======== CURATOR FEEDBACK: ========= <br>' + feedback;
        productEditorService.saveProduct(prod);
    };

    $scope.submitForApproval = function (prod) {
        if (prod.description) {
            var re = /<.*?>.*$/;
            prod.description = prod.description.replace(re, '');
            var re2 = /=+.*?.*$/;
            prod.description = prod.description.replace(re2, '');
        }
        productEditorService.saveProduct(prod)
        productEditorService.finishProduct(prod);
        $('#submitforapproval').modal('hide')
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

    };

    $(window).bind('keydown', function (event) {
        if (event.ctrlKey || event.metaKey) {
            var prod = productEditorService.currentProduct;

            switch (String.fromCharCode(event.which).toLowerCase()) {
                case 's':
                    event.preventDefault();
                    $scope.updateProduct(prod);
                    break;
                case 'd':
                    event.preventDefault();
                    $scope.submitForApproval(prod)

            }
        }
    });

    $scope.buttonDisplay = function (button, product) {
        var bool = false;
        switch (button) {
            case 'Edit':
                if (product.status !== 'done' && product.userId == $scope.userId) {
                    bool = true;
                }
                if (product.status == 'approved') {
                    bool = false;
                }
                break;
            case 'Unassign':
                if (product.status !== 'done' && product.userId == $scope.userId) {
                    bool = true;
                }
                if (product.status == 'approved') {
                    bool = false;
                }
                break;
            case 'Claim':
                if (product.status == 'new' && !product.userId) {
                    bool = true;
                }
                break;
        }

        return bool

    };


    init();



});
