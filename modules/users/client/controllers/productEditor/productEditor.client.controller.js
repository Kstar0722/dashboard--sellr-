angular.module('users').controller('productEditorController', function ($scope, Authentication, productEditorService, $location, $state, $stateParams, Countries, $mdMenu, constants) {

    Authentication.user = Authentication.user || { roles: '' };
    $scope.$state = $state;
    $scope.pes = productEditorService;
    // $scope.userId = Authentication.userId || localStorage.getItem('userId') || 407;
    $scope.userId = localStorage.getItem('userId');
    $scope.detail = {
        template: 'modules/users/client/views/productEditor/productEditor.detail.html'
    };
    $scope.display = {
        myProducts: false
    };

    $scope.permissions = {
        editor: Authentication.user.roles.indexOf('editor') > -1 || Authentication.user.roles.indexOf('admin') > -1,
        curator: Authentication.user.roles.indexOf('curator') > -1 || Authentication.user.roles.indexOf('admin') > -1
    };

    $scope.search = {};
    $scope.searchLimit = 15;

    $scope.showMore = function () {
        $scope.searchLimit += 15;
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
        console.log('init controller. Account is %s', productEditorService.currentAccount)
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
            default:
                type = { name: 'wine', productTypeId: 1 };
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
            default:
                status = { name: 'Available', value: 'new' };
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

    $scope.quickEdit = function (product) {
        var options = {
            userId: $scope.userId,
            productId: product.productId,
            status: 'done'
        };
        productEditorService.claim(options);
        productEditorService.setCurrentProduct(product);
        productEditorService.currentStatus = { name: 'Done', value: 'done' };
        $state.go('editor.products.detail', {
            type: productEditorService.currentType.name,
            status: 'done',
            productId: product.productId,
            task: 'edit'
        });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.edit.html'

    }

    $scope.sendBack = function (product, feedback) {
        product.description += '<br>======== CURATOR FEEDBACK: ========= <br>' + feedback;
        product.status = 'inprogress';
        productEditorService.save(product);
    };

    $scope.submitForApproval = function (product) {
        if (product.description) {
            var re = /<.*?>.*$/;
            product.description = product.description.replace(re, '');
            var re2 = /=+.*?.*$/;
            product.description = product.description.replace(re2, '');
        }
        product.status = 'done';
        productEditorService.save(product);
        $scope.viewProduct(product)
        $('#submitforapproval').modal('hide')
    };

    $scope.approveProduct = function (product) {
        product.status = 'approved';
        productEditorService.save(product);
    };

    $scope.save = function (product) {
        product.status = 'inprogress';
        productEditorService.save(product)
    };

    $scope.updateProduct = function (product) {
        if (product.status != 'done') {
            product.status = 'inprogress';
        }
        productEditorService.save(product)
    };

    $scope.flagAsDuplicate = function (product, comments) {
        product.description += ' | DUPLICATE:' + comments;
        product.status = 'duplicate';
        productEditorService.save(product)
    };

    $scope.updateCounts = function () {
        productEditorService.getStats()
    }


    $scope.playAudio = function () {
        productEditorService.currentProduct.audio.play()
    };
    $scope.pauseAudio = function () {
        productEditorService.currentProduct.audio.pause()
    };
    $scope.removeAudio = function () {
        var currentAudio = productEditorService.currentProduct.audio.mediaAssetId;
        productEditorService.removeAudio(currentAudio)
    };
    $scope.seekAudio = function () {
        productEditorService.currentProduct.audio.currentTime = productEditorService.currentProduct.audio.progress * productEditorService.currentProduct.audio.duration

    };
    //ignore this
    $scope.removeImage = function (current) {
        productEditorService.removeImage(current)
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
            case 'Quick Edit':
                if ($scope.permissions.curator && product.status == 'done') {
                    bool = true
                }
        }

        return bool

    };

    $scope.showProduct = function (product) {
        var display = true;
        if (product.status == 'inprogress' || product.status == 'done') {
            display = (product.userId == $scope.userId || $scope.permissions.curator);
        }
        if ($scope.display.myProducts) {
            display = product.userId == $scope.userId
        }
        return display;
    };


    init();



});
