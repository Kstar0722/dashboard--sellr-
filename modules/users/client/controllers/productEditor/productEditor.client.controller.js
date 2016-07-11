angular.module('users').controller('productEditorController', function ($scope, Authentication,$q, $http, productGridData, productEditorService, uiGridConstants,  $location, $state, $stateParams, Countries, $mdMenu, constants, MediumS3ImageUploader) {

    Authentication.user = Authentication.user || { roles: '' };
    $scope.$state = $state;
    $scope.pes = productEditorService;
    // $scope.userId = Authentication.userId || localStorage.getItem('userId') || 407;
    $scope.userId = localStorage.getItem('userId');
    $scope.detail = {
        template: 'modules/users/client/views/productEditor/productEditor.detail.view.html'
    };
    $scope.display = {
        myProducts: false,
        feedback: true
    };

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
    $scope.searchLimit = 15;
    $scope.gridOptions = {
        //enableSelectAll: true,
        enableRowSelection: true,
        //enableGridMenu: true,
        rowEditWaitInterval: -1,
        enableFiltering: true,
        onRegisterApi: function (gridApi) {
            $scope.loadingData = false;
            $scope.gridApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                //When you select an item, add the keys for that item and add it to the "to edit" array.
                row.entity.keys = Object.keys(row.entity);
                $scope.showPanel = true;
                $scope.editMultipleProducts.push(row.entity);
                console.dir($scope.editMultipleProducts)
            });

        },
        columnDefs: [
            {field: 'name'}
        ]
    };

    $scope.searchLimit = 15;

    $scope.showMore = function () {
        $scope.searchLimit += 15;
    };

    $scope.searchProducts = function (searchText) {
        $scope.loadingData = true;
        $scope.gridOptions.data = [];
        var fields = [];
        var columnNames = [];

        productGridData.searchProducts(searchText).then(function (data) {
            $scope.loadingData = false;
            $scope.products = data;


        })
    };





        //TODO: update with new side bar selection
    $scope.viewProduct = function (product) {
        console.log('hello')
        productEditorService.setCurrentProduct(product);
        $state.go('editor.products', { productId: product.productId, task: 'view' });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.view.html'
    };

    $scope.quickEdit = function (product) {
        var options = {
            userId: $scope.userId,
            productId: product.productId,
            status: 'inprogress'
        };
        productEditorService.claim(options);
        productEditorService.setCurrentProduct(product);
        $state.go('editor.products.detail', {
            productId: product.productId,
            task: 'edit'
        });
        $scope.detail.template = 'modules/users/client/views/productEditor/productEditor.detail.edit.html'

    }


    //NOTE: alot of what's below is from old function product editor but might be useful with new editor including ui grid
    $scope.sendBack = function (product, feedback) {
        product.feedback = feedback;
        product.status = 'inprogress';
        productEditorService.save(product);
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
    $scope.productsSelection = {}
    $scope.productsSelection.contains = false
    $scope.people = [
        {name: 'Diego Fortes', img: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50', selected: true},
        {name: 'Tom Cruise', img: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50', selected: false},
        {name: 'C3PO Robo', img: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50', selected: false}
    ]

    $scope.buttonDisplay = function (button, product) {
        var bool = false;
        switch (button) {
            case 'Edit':

                break;
            case 'Unassign':

                break;
            case 'Claim':

                break;
            case 'Quick Edit':
     
        }

    }





});
