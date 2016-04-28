'use strict';
angular.module('users').service('productEditorService', function ($http, $location, constants, Authentication, $stateParams, $q, toastr) {
    var me = this;
    var debugLogs = true;
    var log = function (title, data) {
        if (debugLogs) {
            title += '%O';
            console.log(title, data);
        }
    };
    var cachedProduct;
    me.changes = [];


    me.init = function () {
        me.productTypes = [ { name: 'wine', productTypeId: 1 }, { name: 'beer', productTypeId: 2 }, { name: 'spirits', productTypeId: 3 } ];
        me.productStatuses = [
            { name: 'Available', value: 'new' },
            { name: 'In Progress', value: 'inprogress' },
            { name: 'Done', value: 'done' },
            { name: 'Approved', value: 'approved' }
        ];
        me.productStats = {};
        me.productList = [];
        me.myProducts = [];
        me.stats = {};
        me.currentProduct = {};
        me.currentType = me.productTypes[ 0 ];
        me.currentStatus = me.productStatuses[ 0 ];
        //initialize with new products so list isnt empty
        log('productServiceInit', me.currentType);

        me.getStats();
        me.updateProductList();
    };

    //send in type,status and receive all products (limited to 50)
    me.getProductList = function (options) {
        if (!options.type || !options.status) {
            options = {
                type: me.currentType.productTypeId,
                status: me.currentStatus.value
            };
        }
        log('getProdList options', options);
        var url = constants.BWS_API + '/edit?status=' + options.status.value + '&type=' + options.type.productTypeId;
        $http.get(url).then(getAvailProdSuccess, getAvailProdError);

        function getAvailProdSuccess(response) {
            if (response.status === 200) {
                me.productList = response.data
            }
        }
        function getAvailProdError(error) {
            console.error('getAvailProdError %O', error)
        }
    };

    me.updateProductList = function () {
        me.getProductList({ type: me.currentType, status: me.currentStatus })
    };

    //send in type,status,userid, get back list of products
    me.getMyProducts = function (options) {
        options = options | {};
        if (!options.type || !options.status || !options.userId) {
            options = {
                type: me.currentType.productTypeId,
                status: me.currentStatus.value,
                userId: 407
            };

            // console.error('getMyProducts: Please add a type, status and userId to get available products %O', options)
        }
        var url = constants.BWS_API + '/edit?status=' + options.status + '&type=' + options.type + '&user=' + options.userId;
        $http.get(url).then(getMyProdSuccess, getMyProdError);

        function getMyProdSuccess(response) {
            if (response.status === 200) {
                me.productList = response.data
            }
        }

        function getMyProdError(error) {
            console.error('getMyProdError %O', error)
        }
    };


    me.setCurrentProduct = function (product) {
        me.currentProduct = {};
        cachedProduct = {};
        me.changes = [];

        if (!product.productId) {
            console.error('setCurrentProduct: please provide productId')
            return
        }
        me.getProductDetail(product.productId).then(onGetProductDetailSuccess, onGetProductDetailError);
        function onGetProductDetailSuccess(res) {
            if (res.data.length > 0) {
                me.formatProductDetail(res.data[ 0 ]).then(function (formattedProduct) {
                    var p = formattedProduct;
                    log('formattedProduct', formattedProduct);
                    me.currentProduct = formattedProduct;
                    cachedProduct = jQuery.extend(true, {}, formattedProduct);

                })
            } else {
                toastr.error('Could not get product detail for ' + product.name)
            }
        }

        function onGetProductDetailError(err) {
            console.error('onGetProductDetailError %O', err)
        }
    };


    me.getProductDetail = function (productId) {
        if (!productId) {
            console.error('getProductDetail: please provide productId')
            return
        }
        var url = constants.BWS_API + '/products/' + productId;
        log('getting product detail for ', url)
        return $http.get(url)
    }


    //claim a product
    me.claim = function (options) {
        //options should have userId and productId
        if (!options.productId || !options.userId) {
            console.error('could not claim, wrong options')
        }
        var payload = {
            "payload": options
        };
        log('claiming', payload);
        var url = constants.BWS_API + '/edit/claim';
        $http.post(url, payload).then(function (res) {
            log('claim response', res)
        })
    };


    me.saveProduct = function (product) {
        //check productId
        if (!product.productId) {
            console.error('saveProduct: no productId specified %O', product)
            return
        }
        product = compareToCachedProduct(product);
        product.status = 'inprogress';

        //TODO: get real userId
        product.userId = 407;
        var payload = {
            payload: product
        };
        log('saveProduct', payload)
        var url = constants.BWS_API + '/products/' + product.productId;
        $http.put(url, payload).then(onUpdateSuccess, onUpdateError);

        function onUpdateSuccess(response) {
            log('onUpdateSuccess', response)
            window.scrollTo(0, 0);

        }

        function onUpdateError(error) {
            toastr.error('There was a problem updating this product', 'Could not save')
            console.error('onUpdateError %O', error)
        }
    };


    me.finishProduct = function (product) {
        if (!product.productId) {
            console.error('finishProduct: no productId specified %O', product)
        }
        product.status = 'done';
        var payload = {
            payload: product
        };
        var url = constants.BWS_API + '/products/' + product.productId;
        $http.put(url, payload).then(onFinishSuccess, onFinishError);

        function onFinishSuccess(response) {
            console.log('onFinishSuccess %O', response)
        }

        function onFinishError(error) {
            console.error('onFinishError %O', error)
        }
    };


    me.approveProduct = function (product) {
        if (!product.productId) {
            console.error('approveProduct: no productId specified %O', product)
        }
        product.status = 'approved';
        var payload = {
            payload: product
        };
        var url = constants.BWS_API + '/products/' + product.productId;
        $http.put(url, payload).then(onApproveSuccess, onApproveError);

        function onApproveSuccess(response) {
            console.log('onApproveSuccess %O', response)
        }

        function onApproveError(error) {
            console.error('onApproveError %O', error)
        }
    };


    me.getStats = function () {
        var url = constants.BWS_API + '/edit/count';
        $http.get(url).then(onGetStatSuccess, onGetStatError);
        function onGetStatSuccess(response) {
            console.log('onGetStatSuccess %O', response);
            me.productStats = response.data
        }

        function onGetStatError(error) {
            console.log('onGetStatError %O', error)
            me.productStats = {}
        }
    };

    me.formatProductDetail = function (product) {
        var defer = $q.defer()
        product.title = product.title || product.displayName || product.name;
        product.properties.forEach(function (prop) {
            switch (prop.label) {
                case 'Country':
                    prop.type = 'countryselect'
                    break;
                case 'Script':
                    prop.type = 'textarea';
                    break;
                case 'Description':
                    prop.type = 'textarea';
                    break;
                case 'foodpairing':
                    prop.type = 'textarea';
                    break;
                default:
                    prop.type = 'input';
                    break;
            }
        });
        product.mediaAssets.forEach(function (m) {
            switch (m.type) {
                case 'AUDIO':
                    product.description = m.script;
                    product.audio = document.createElement('AUDIO');
                    product.audio.src = m.publicUrl;
                    product.audio.ontimeupdate = function setProgress() {
                        product.audio.progress = Number(product.audio.currentTime / product.audio.duration);
                    };
                    break;
                case 'IMAGE':
                    product.hasImages = true;
                    product.images = product.images || [];
                    product.images.push(m)
            }
        });
        defer.resolve(product);

        return defer.promise;
    };

    me.uploadMedia = function (file) {
        var mediaAssetId;
        var obj = {
            payload: {
                fileName: file[ 0 ].name,
                userName: Authentication.user.username,
                type: 'IMAGE'
            }
        };

        //TODO: tie into new upload service
    };

    function compareToCachedProduct(prod) {
        log('updatedProd', prod);
        log('cachedProd', cachedProduct);
        me.changes = [];
        if (prod.title !== cachedProduct.title) {
            me.changes.push('Changed title to ' + cachedProduct.title)
        }

        for (var i = 0; i < prod.properties.length; i++) {
            var updated = prod.properties[ i ];
            var cached = cachedProduct.properties[ i ];

            if (updated.value !== cached.value) {
                if (cached.value === '') {
                    updated.changed = 'new';
                    me.changes.push('Added ' + updated.label + ' as ' + updated.value)
                } else {
                    updated.changed = 'update';
                    me.changes.push('Updated ' + updated.label + '. Changed ' + '"' + cached.value + '"' + ' to ' + '"' + updated.value + '"')
                }
            } else {
                updated.changed = 'false';
            }
        }
        log('changes added', prod);
        return (prod)
    }

    me.init();

    return me;
});
