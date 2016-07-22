angular.module('users').controller('productEditorController', function ($scope, Authentication, $q, $http, productEditorService,
                                                                        $location, $state, $stateParams, Countries,
                                                                        $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService) {
    Authentication.user = Authentication.user || { roles: '' }
    $scope.$state = $state
    $scope.pes = productEditorService;
    $scope.mergeService = mergeService;
    // $scope.userId = Authentication.userId || localStorage.getItem('userId') || 407
    $scope.userId = window.localStorage.getItem('userId')
    $scope.display = {
        myProducts: false,
        feedback: true
    }

    $scope.permissions = {
        editor: Authentication.user.roles.indexOf(1010) > -1 || Authentication.user.roles.indexOf(1004) > -1,
        curator: Authentication.user.roles.indexOf(1011) > -1 || Authentication.user.roles.indexOf(1004) > -1
    };

    $scope.mediumEditorOptions = {
        imageDragging: false,
        extensions: {
            's3-image-uploader': new MediumS3ImageUploader()
        }
    };

    $scope.search = {};
    $scope.checkbox = {};
    $scope.checkbox.progress = {};
    $scope.filter = [];
    $scope.searchLimit = 15;

    $scope.listOptions = {}
    $scope.listOptions.searchLimit = 15
    $scope.listOptions.orderBy = '+name'

    $scope.showMore = function () {
        $scope.listOptions.searchLimit += 15
        refreshList()
    }

    $scope.reOrderList = function (field) {
        switch (field) {
            case 'name':
                $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+n' ? '-name' : '+name'
                break
            case 'sku':
                $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+s' ? '-sku_count' : '+sku_count'
                break
            case 'audio':
                $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+a' ? '-audio' : '+audio'
                break
            case 'image':
                $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+i' ? '-image' : '+image'
                break
            default:
                break
        }
        refreshList()
    }

    $scope.searchProducts = function (searchText) {
        $scope.loadingData = true;
        var options = { status: $scope.checkbox.progress, types: $scope.filter };
        productEditorService.getProductList(searchText, options).then(function (data) {
            $scope.products = data
            $scope.loadingData = false;
        })
    };

    var refreshList = function () {
        $scope.allProducts = $filter('orderBy')($scope.allProducts, $scope.listOptions.orderBy)
        $scope.products = $filter('limitTo')($scope.allProducts, $scope.listOptions.searchLimit)
    };

    $scope.toggleSelected = function (product) {
        $scope.selected = $scope.selected || [];
        var i = _.findIndex($scope.selected, function (selectedProduct) {
            return selectedProduct.productId == product.productId
        });
        if (i < 0) {
            $scope.selected.push(product)
        } else {
            $scope.selected.splice(i, 1)
        }
        console.log('toggleSelected %O', $scope.selected)
    };

    $scope.viewProduct = function (product) {
        productEditorService.setCurrentProduct(product);
        $state.go('editor.view', { productId: product.productId });
    };

    $scope.quickEdit = function (product) {
        var options = {
            userId: $scope.userId,
            productId: product.productId,
            status: 'inprogress'
        };
        productEditorService.claim(options);
        productEditorService.setCurrentProduct(product);
        $state.go('editor.edit', { productId: product.productId });


    }

    $scope.updateFilter = function (value) {

        $scope.checked = false;
        for (var i in $scope.filter) {
            if ($scope.filter[ i ].type == value.type) {
                $scope.filter.splice(i, 1)
                $scope.checked = true;
            }
        }
        if (!$scope.checked) {
            $scope.filter.push(value)
        }
    };

    $scope.mergeProducts = function () {
        mergeService.merge($scope.selected).then(function () {
            console.log('mergeProducts %O', $scope)
            $state.go('editor.merge');
        })
    };

    $scope.removeMergedImage = function (i) {
        mergeService.newProduct.images.splice(i, 1)
    };

    $scope.playMergedAudio = function (i) {
        for (var a = 0; a < mergeService.newProduct.audio.length; a++) {
            mergeService.newProduct.audio[ a ].pause()
            mergeService.newProduct.audio[ a ].currentTime = 0;
            if (a == i) {
                mergeService.newProduct.audio[ i ].play()
            }
        }
    };

    $scope.pauseMergedAudio = function () {
        mergeService.newProduct.audio.forEach(function (a) {
            a.pause()
        })
    };

    $scope.removeMergedAudio = function (i) {
        mergeService.newProduct.audio[ i ].pause()
        mergeService.newProduct.audio.splice(i, 1)
    };


    ///


    ///


    ///


    ///


    ///


    ///


    ///


    ///


    ///


    ///


    ///


    ///


    ///


    ///


    ///


    // NOTE: alot of what's below is from old function product editor but might be useful with new editor including ui grid
    $scope.sendBack = function (product, feedback) {
        product.feedback = feedback
        product.status = 'inprogress'
        productEditorService.save(product)
    }

    $scope.approveProduct = function (product) {
        product.status = 'approved'
        productEditorService.save(product)
    }

    $scope.save = function (product) {
        product.status = 'inprogress'
        productEditorService.save(product)
    }

    $scope.updateProduct = function (product) {
        if (product.status !== 'done') {
            product.status = 'inprogress'
        }
        productEditorService.save(product)
    }

    $scope.flagAsDuplicate = function (product, comments) {
        product.description += ' | DUPLICATE:' + comments
        product.status = 'duplicate'
        productEditorService.save(product)
    }

    $scope.updateCounts = function () {
        productEditorService.getStats()
    }

    $scope.playAudio = function () {
        productEditorService.currentProduct.audio.play()
    }
    $scope.pauseAudio = function () {
        productEditorService.currentProduct.audio.pause()
    }
    $scope.removeAudio = function () {
        var currentAudio = productEditorService.currentProduct.audio.mediaAssetId
        productEditorService.removeAudio(currentAudio)
    }
    $scope.seekAudio = function () {
        productEditorService.currentProduct.audio.currentTime = productEditorService.currentProduct.audio.progress * productEditorService.currentProduct.audio.duration
    }
    // ignore this
    $scope.removeImage = function (current) {
        productEditorService.removeImage(current)
    }
    $(window).bind('keydown', function (event) {
        if (event.ctrlKey || event.metaKey) {
            var prod = productEditorService.currentProduct

            switch (String.fromCharCode(event.which).toLowerCase()) {
                case 's':
                    event.preventDefault()
                    $scope.updateProduct(prod)
                    break
                case 'd':
                    event.preventDefault()
                    $scope.submitForApproval(prod)

            }
        }
    });

    $scope.productsSelection = {}
    $scope.productsSelection.contains = false
    $scope.people = [
        { name: 'Diego Fortes', img: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50', selected: true },
        { name: 'Tom Cruise', img: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50', selected: false },
        { name: 'C3PO Robo', img: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50', selected: false }
    ]

    $scope.buttonDisplay = function (button, product) {
        // var flag = false
        switch (button) {
            case 'Edit':

                break
            case 'Unassign':

                break
            case 'Claim':

                break
            case 'Quick Edit':

        }
    }
})
