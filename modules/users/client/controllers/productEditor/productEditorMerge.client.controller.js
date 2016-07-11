
angular.module("users").controller("productEditorMergeController", function ($scope,productFields,Authentication, productGridData,productEditorService, uiGridConstants, $state,$location,$stateParams, $q, $http,constants, $timeout) {
    "use strict";
    Authentication.user = Authentication.user || { roles: '' };
    $scope.$state = $state;
    $scope.pes = productEditorService;
    // $scope.userId = Authentication.userId || localStorage.getItem('userId') || 407;
    $scope.userId = localStorage.getItem('userId');

    $scope.permissions = {
        editor: Authentication.user.roles.indexOf(1010) > -1 || Authentication.user.roles.indexOf(1004) > -1,
        curator: Authentication.user.roles.indexOf(1011) > -1 || Authentication.user.roles.indexOf(1004) > -1
    };

    $scope.names = ["new", "inprogress", "available"];
    $scope.types = ["beer", "wine", "spirits"];
    var url = '';
    $scope.$watch('stuff', function(stuff) {
        if (!stuff) {
            return;
        }
        url += "status="+stuff;
        console.log(url)
        $state.transitionTo('.', {variable: url}, { location: true, inherit: false, relative: $state.$current, notify: false })
    });

    $scope.loadingData = true;
    $scope.wd = productGridData;
    $scope.showPanel = false;
    $scope.showEdit = true;
    $scope.editProductsIndex = 0;
    $scope.editOneProduct = null;
    $scope.editMultipleProducts = [];
    $scope.newProduct = {};

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


    $scope.getData = function (type) {
        $scope.loadingData = true;
        $scope.gridOptions.data = [];
        //$scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        productGridData.getData(type).then(function (data) {
            if (type == 1) {
                $scope.productType = 'Wine';
                $scope.gridOptions.columnDefs = productFields.wine;
            }
            if (type == 2) {
                $scope.productType = 'Beer';
                $scope.gridOptions.columnDefs = productFields.beer;
            }
            if (type == 3) {
                $scope.productType = 'Spirits';
                $scope.gridOptions.columnDefs = productFields.spirits;
            }
            $scope.loadingData = false;
            $scope.gridOptions.data = data;
            $scope.productCount = data.length;
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            $timeout(function () {
                //$scope.removeExtraColumns()
            }, 0)
        })
    };

    $scope.removeExtraColumns = function () {
        console.dir($scope.gridOptions.columnDefs);
        for (var i = 0; i < $scope.gridOptions.columnDefs.length; i++) {
            if ($scope.gridOptions.columnDefs[i].name === "_typeInfo") {
                console.dir($scope.gridOptions.columnDefs[i]);
                $scope.gridOptions.columnDefs[i].visible = false;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            } else if ($scope.gridOptions.columnDefs[i].name === "_original") {
                $scope.gridOptions.columnDefs[i].visible = false;
                $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
            }
        }
    };

    $scope.saveRow = function (rowEntity) {
        var defer = $q.defer();
        $scope.gridApi.rowEdit.setSavePromise(rowEntity, defer.promise);
        productGridData.updateWidget(rowEntity).then(function (res) {
            console.dir(res)
            defer.resolve()
        })
        return defer.promise;
    };

    $scope.searchProducts = function () {
        $scope.loadingData = true;
        $scope.gridOptions.data = [];
        var fields = [];
        var columnNames = [];
        console.log('search products called')
        productGridData.searchProducts($scope.searchText).then(function (data) {
            console.log(data)
            $scope.loadingData = false;
            data.forEach(function(data){
                Object.keys(data).forEach(function(column){
                    if(columnNames.indexOf(column)  <0 && column != 'properties' && column != 'mediaAssets'  && column != 'feedback' && column != 'notes' ){
                        fields.push({field: column});

                    }
                    columnNames.push(column)
                })
               data["properties"].forEach(function(label){
                    if(columnNames.indexOf(label.label)  <0 ){
                        fields.push({field: label.label});
                        data[label.label] = label.value;
                    }
                    columnNames.push(label.label)
                })
                data["mediaAssets"].forEach(function(label){

                    if(columnNames.indexOf(label.type)  <0 ){
                        fields.push({field: label.type});
                        data[label.type] = label.publicUrl;
                    }
                    columnNames.push(label.type)
                })
            })
            $scope.gridOptions.columnDefs = fields;
            $scope.gridOptions.data = data;
            $scope.productCount = data.length;
            $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
        })
    };

    $scope.saveEditedRows = function () {
        $scope.gridApi.rowEdit.flushDirtyRows();
        $scope.editOneProduct = null;
        $scope.editMultipleProducts = [];
    };

    $scope.saveModalEdits = function () {
        var products = [];
        products.push($scope.editOneProduct);
        products.push($scope.editMultipleProducts);
        products.forEach(function (product) {
            productGridData.updateWidget(product).then(function (res) {
                console.dir(res);
                defer.resolve()
            })
        })
    };

    $scope.nextEditProduct = function () {
        if ($scope.editProductsIndex < ($scope.editMultipleProducts.length - 1)) {
            $scope.editProductsIndex++;
        } else {
            $scope.editProductsIndex = 0;
        }
    };

    $scope.panelSaveProduct = function () {
        var product = $scope.editMultipleProducts[$scope.editProductsIndex];
        delete product.$$hashKey;
        productGridData.updateWidget(product).then(function (res) {
            alert('product saved: ' + res.data);
            $scope.editMultipleProducts.splice($scope.editProductsIndex, 1)
            if ($scope.editMultipleProducts.length < 1) {
                $scope.showPanel = false;
            }
        })
    };

    $scope.setNewProductProperties = function () {
        if ($scope.newProduct.type == 1) {
            $scope.newProduct.properties = [];
            productFields.wine.forEach(function (field) {
                $scope.newProduct.properties.push({key: field.field, value: ''});
                $scope.newProductGrid.data = $scope.newProduct.properties

            })
        } else if ($scope.newProduct.type == 2) {
            $scope.newProduct.properties = [];
            productFields.beer.forEach(function (field) {
                $scope.newProduct.properties.push({key: field.field, value: ''})
            })
        } else if ($scope.newProduct.type == 3) {
            $scope.newProduct.properties = [];
            productFields.spirits.forEach(function (field) {
                $scope.newProduct.properties.push({key: field.field, value: ''})
            })
        }
    };

    $scope.createProduct = function () {
        console.dir($scope.newProduct)
    }

    $scope.newProductGrid = {
        //enableSelectAll: true,
        //enableGridMenu: true,
        rowEditWaitInterval: -1,
        enableFiltering: true,
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.rowEdit.on.saveRow($scope, $scope.saveRow);
        }
    };


});
