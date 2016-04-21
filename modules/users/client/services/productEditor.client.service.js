angular.module('users').service('productEditorService', function ($http, $location, constants, Authentication) {
    var me = this;


    me.init = function () {
        me.availableProducts = [];
        me.myProducts = [];
        me.stats = {};
        me.currentType = 1;
        me.getStats();

        //initialize with new products so list isnt empty
        me.getAvailableProducts({ type: me.currentType, status: 'NEW' })
    };

    //send in type,status and receive all products (limited to 50)
    me.getAvailableProducts = function (options) {
        if (!options.type || !options.status) {
            console.error('getAvailableProducts: Please add a type and status to get available products %O', options)
        }
        var url = constants.API_URL + '/edit?status=' + options.status + '&type=' + options.type;
        $http.get(url).then(getAvailProdSuccess, getAvailProdError);

        function getAvailProdSuccess(response) {
            if (response.status === 200) {
                me.availableProducts = response.data
            }
        }

        function getAvailProdError(error) {
            console.error('getAvailProdError %O', error)
        }
    };

    //send in type,status,userid, get back list of products
    me.getMyProducts = function (options) {
        if (!options.type || !options.status || !options.userId) {
            console.error('getMyProducts: Please add a type, status and userId to get available products %O', options)
        }
        var url = constants.API_URL + '/edit?status=' + options.status + '&type=' + options.type + '&user=' + options.user;
        $http.get(url).then(getMyProdSuccess, getMyProdError);

        function getMyProdSuccess(response) {
            if (response.status === 200) {
                me.myProducts = response.data
            }
        }

        function getMyProdError(error) {
            console.error('getMyProdError %O', error)
        }
    };

    //claim a product
    me.claim = function (options) {
        //options should have userId and productId
        if (!options.productId || !options.userId) {
            console.error('could not claim, wrong options')
        }
        var payload = {
            "payload": options
        };
        var url = constants.API_URL + '/edit/claim';
        return $http.post(url, payload)
    };

    me.saveProduct = function (product) {
        //check productId
        if (!product.productId) {
            console.error('saveProduct: no productId specified %O', product)
        }
        product.status = 'NPROGRESS';
        var payload = {
            payload: product
        };
        var url = constants.API_URL + '/products/' + product.productId;
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
        product.status = 'DONE';
        var payload = {
            payload: product
        };
        var url = constants.API_URL + '/products/' + product.productId;
        $http.put(url, payload).then(onFinishSuccess, onFinishError);

        function onFinishSuccess(response) {
            console.log('onFinishSuccess %O', response)
        }

        function onFinishError(error) {
            console.error('onFinishError %O', error)
        }
    };

    me.getStats = function () {
        var url = constants.API_URL + '/edit/stats'
        $http.get(url).then(onGetStatSuccess, onGetStatError);
        function onGetStatSuccess(response) {
            console.log('onGetStatSuccess %O', response)
            me.stats = response.data
        }

        function onGetStatError(error) {
            console.log('onGetStatError %O', error)
        }
    };

    me.uploadMedia = function (file) {
        var mediaAssetId;
        var obj = {
            payload: {
                fileName: file[ 0 ].name,
                userName: Authentication.user.username,
                type: 'IMAGE',
                accountId: accountId
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
