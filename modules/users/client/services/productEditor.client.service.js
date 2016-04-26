'use strict';
angular.module('users').service('productEditorService', function ($http, $location, constants, Authentication, $stateParams, $q) {
    var me = this;
    var debugLogs = true;
    var log = function (title, data) {
        if (debugLogs) {
            title += '%O';
            console.log(title, data);
        }
    };


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
        //TODO: enable actual api call here
        function rand() {
            return Math.floor(Math.random() * 100);
        }
        me.productList = [
            { name: 'Awesome ' + options.type.name + ' 1', productId: 155220, lastEdit: rand() + ' min ago', status: 'inprogress' },
            { name: 'Awesome ' + options.type.name + ' 2', productId: 222222, lastEdit: rand() + ' week(s) ago', status: 'new' },
            { name: 'Awesome ' + options.type.name + ' 3', productId: 333333, lastEdit: rand() + ' hour(s) ago', status: 'done' },
            { name: 'Awesome ' + options.type.name + ' 4', productId: 444444, lastEdit: rand() + ' day(s) ago', status: 'inprogress' }
        ];
        // $http.get(url).then(getAvailProdSuccess, getAvailProdError);

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
        if (!product.productId) {
            console.error('setCurrentProduct: please provide productId')
            return
        }
        me.getProductDetail(product.productId).then(onGetProductDetailSuccess, onGetProductDetailError);
        function onGetProductDetailSuccess(res) {
            if (res.data.length > 0) {
                me.formatProductDetail(res.data[ 0 ]).then(function (formattedProduct) {
                    log('formattedProduct', formattedProduct)
                    me.currentProduct = formattedProduct;
                })
            } else {
                me.currentProduct = {};
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
        var url = constants.BWS_API + '/edit/claim';
        return $http.post(url, payload)
    };

    me.saveProduct = function (product) {
        //check productId
        if (!product.productId) {
            console.error('saveProduct: no productId specified %O', product)
        }
        product.status = 'inprogress';
        var payload = {
            payload: product
        };
        var url = constants.BWS_API + '/products/' + product.productId;
        $http.put(url, payload).then(onUpdateSuccess, onUpdateError);

        function onUpdateSuccess(response) {
            console.log('onUpdateSuccess %O', response)
        }

        function onUpdateError(error) {
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

        //TODO: api call
        me.productStats = {
            1: {
                new: 15,
                inprogress: 12,
                done: 62,
                approved: 92
            },
            2: {
                new: 14,
                inprogress: 6,
                done: 1,
                approved: 918
            },
            3: {
                new: 56,
                inprogress: 234,
                done: 151,
                approved: 342
            }
        };
        // $http.get(url).then(onGetStatSuccess, onGetStatError);
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

        $http.post(constants.API_URL + '/media', obj).then(function (response, err) {
            if (err) {
                console.log(err);
            }
            if (response) {
                console.log('oncue API response %O', response);
                mediaAssetId = response.data.assetId;
                var creds = {
                    bucket: 'beta.cdn.expertoncue.com',
                    access_key: 'AKIAICAP7UIWM4XZWVBA',
                    secret_key: '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'
                };
                // Configure The S3 Object
                AWS.config.update({
                    accessKeyId: creds.access_key,
                    secretAccessKey: creds.secret_key
                });
                AWS.config.region = 'us-east-1';
                var bucket = new AWS.S3({ params: { Bucket: creds.bucket } });
                var params = {
                    Key: mediaAssetId + "-" + file[ 0 ].name,
                    ContentType: file[ 0 ].type,
                    Body: file[ 0 ],
                    ServerSideEncryption: 'AES256',
                    Metadata: {
                        fileKey: JSON.stringify(response.data.assetId)
                    }
                };

                bucket.putObject(params, function (err, data) {
                        if (err) {
                            // There Was An Error With Your S3 Config
                            alert(err.message);
                            return false;
                        }
                        else {
                            console.log('s3 response to upload %O', data);
                            // Success!
                        }
                    })
                    .on('httpUploadProgress', function (progress) {
                        // Log Progress Information
                        console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                    });
            }
            else {
                // No File Selected
                alert('No File Selected');
            }
        });
    };


    return me;
});
