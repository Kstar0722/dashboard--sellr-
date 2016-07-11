/**
 * Created by mac4rpalmer on 6/27/16.
 */
angular.module('users').factory('productGridData', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout) {
    "use strict";
    var me = this;

    var API_URL = constants.BWS_API;


    me.addField = addField;
    me.getData = getData;
    me.updateWidget = updateWidget;
    me.searchProducts = searchProducts;
    return me;


    function getData(type) {
        var defer = $q.defer();
        console.log(type)
        $http.get(API_URL + '/edit/search?type=' + type).then(function (widgets) {
            console.log(widgets);
            var allWidgets = widgets.data;
            defer.resolve(allWidgets)
        });
        return defer.promise;
    }

    function searchProducts(searchText) {
        var defer = $q.defer();

        $http.get(API_URL + '/edit/search?q=' + searchText + '&v=sum')
            .then(function (response) {
                var searchedProducts = response.data;
                console.dir(response)
                defer.resolve(searchedProducts)
            });
        return defer.promise;
    }

    function updateWidget(rowEntity) {
        var defer = $q.defer();
        var payload = {
            "payload": {
                "products": [rowEntity]
            }
        };
        $http.put(API_URL + '/edit', payload).then(function (res) {
            console.dir(res);
            defer.resolve(res)
        });
        return defer.promise
    }
    function updateWidget(product)  {
        var defer = $q.defer();
        if (!product.productId) {
            return
        }
        product.userId = me.userId;
        if (!product.userId) {
            if (localStorage.getItem('userId')) {
                me.userId = localStorage.getItem('userId');
                product.userId = me.userId;
            }
        }
        if (!product.userId) {
            toastr.error('There was a problem saving this product. Please sign out and sign in again.')
            return
        }
        var payload = {
            payload: compareToCachedProduct(product)
        };
        var url = constants.BWS_API + '/edit/products/' + product.productId;
        $http.put(url, payload).then(onSaveSuccess, onSaveError);
        function onSaveSuccess(response) {
            window.scrollTo(0, 0);
            //socket.emit('product-saved');
            me.productStorage[ product.productId ] = product;
            toastr.success('Product Updated!')
            defer.resolve()
        }

        function onSaveError(error) {
            console.error('onSaveError %O', error);
            toastr.error('There was a problem updating product ' + product.productId);
            defer.reject()
        }

        return defer.promise
    };



    function getFields() {
        var defer = $q.defer();
        $http.get(API_URL + '/widgets/types').then(function (res) {
            var data = res.data.payload;
            for (var type in data) {
                var typeName = data[type]._typeInfo.typeName.toLowerCase();
                me.fieldList[typeName] = {
                    type: typeName,
                    fields: []
                };
                var fields = data[type]._typeInfo.propertyInfo;
                for (var field in fields) {
                    var fieldName = fields[field].propertyName;
                    me.fieldList[typeName].fields.push(fieldName)
                }
            }
            defer.resolve(me.fieldList);
        });
        return defer.promise;
    }

    //getFields().then(function (fieldList) {
    //});
    function addField(widget) {
        var newField = {
            fieldName: '',
            value: ''
        };
        widget.customFields = widget.customFields || [];
        widget.customFields.push(newField)
    }


    function getDataAndClean(search) {
        var defer = $q.defer();
        getData(search).then(function (allWidgets) {
            var cleanWidgets = [];
            for (var i in allWidgets) {
                removeUnnecessaryProperties(allWidgets[i]).then(function (newWidget) {
                    cloneOriginal(newWidget).then(function (finalWidget) {
                        cleanWidgets.push(finalWidget)
                    })

                })
            }
            defer.resolve(cleanWidgets);
            //defer.resolve(allWidgets)
        });
        return defer.promise;

    }

    function removeUnnecessaryProperties(widget) {
        var defer = $q.defer();
        var unnecessaryProperties = [
            'hasVideo', 'hasAudio', 'hasText', 'hasImage', 'isReady', 'hasQuickResponseCode', 'description'
        ];
        for (var i = 0; i < unnecessaryProperties.length; i++) {
            if (_.has(widget, unnecessaryProperties[i])) {
                delete widget[unnecessaryProperties[i]]
            }
        }
        defer.resolve(widget);
        return defer.promise;
    }

    function cloneOriginal(widget) {
        var defer = $q.defer();
        widget['_original'] = _.clone(widget);
        defer.resolve(widget);
        return defer.promise;
    }


});
