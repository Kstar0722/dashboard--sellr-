'use strict';
angular.module('users').service('productEditorService', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout) {
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
    if (localStorage.getItem('userId')) {
        me.userId = localStorage.getItem('userId');
    }
    me.show = {
        loading: true
    };

    try {
        throw new Error('hello from the other side')
    } catch (e) {
        Raygun.send(e, { context: 'Testing Raygun' })
    }


    me.init = function () {
        me.productTypes = [ { name: 'wine', productTypeId: 1 }, { name: 'beer', productTypeId: 2 }, { name: 'spirits', productTypeId: 3 } ];
        me.productStatuses = [
            { name: 'Available', value: 'new' },
            { name: 'In Progress', value: 'inprogress' },
            { name: 'Done', value: 'done' },
            { name: 'Approved', value: 'approved' }
        ];
        me.productStorage = {}
        me.productStats = {};
        me.productList = [];
        me.myProducts = [];
        me.currentProduct = {};
        me.currentType = {};
        me.currentStatus = {};
        //initialize with new products so list isnt empty

        me.getStats();
        me.show.loading = false;
    };

    //send in type,status and receive all products (limited to 50)
    me.getProductList = function (options) {
        me.productList = [];
        me.show.loading = true;
        console.time('getProductList');
        if (!options.type || !options.status) {
            options = {
                type: me.currentType.productTypeId,
                status: me.currentStatus.value
            };
        }
        var url = constants.BWS_API + '/edit?status=' + options.status.value + '&type=' + options.type.productTypeId;
        $http.get(url).then(getAvailProdSuccess, getAvailProdError);

        function getAvailProdSuccess(response) {
            if (response.status === 200) {
                console.timeEnd('getProductList');
                me.show.loading = false;
                log('getProdList ', response.data);
                me.getStats();
                response.data = response.data.map(function (product) {
                    if (product.lastEdit) {
                        if (constants.env === 'local') {
                            product.lastEdit = moment(product.lastEdit).subtract(4, 'hours').fromNow();
                            log('lastEdit', product.lastEdit)
                        } else {
                            product.lastEdit = moment(product.lastEdit).fromNow()
                        }
                    }
                    return product
                });
                
                //sort with myProducts at the top
                me.productList = _.sortBy(response.data, function (p) {
                    return Math.abs(p.userId - me.userId);
                });
                
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
                userId: me.userId
            };
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


    //calls get detail from API and caches product
    me.setCurrentProduct = function (product) {
        me.currentProduct = {};
        cachedProduct = {};
        me.changes = [];

        if (!product.productId) {
            console.error('setCurrentProduct: please provide productId')
            return
        }
        if (me.productStorage[ product.productId ]) {
            //use cached product if exists
            me.currentProduct = me.productStorage[ product.productId ];
            cachedProduct = jQuery.extend(true, {}, me.productStorage[ product.productId ]);

        } else {
            //get from api and format
            me.getProductDetail(product).then(function (res) {
                if (res.data.length > 0) {
                    me.formatProductDetail(res.data[ 0 ]).then(function (formattedProduct) {
                        var p = formattedProduct;
                        log('formattedProduct', formattedProduct);
                        me.currentProduct = formattedProduct;

                        //cache current product for comparison
                        cachedProduct = jQuery.extend(true, {}, formattedProduct);

                        //store product for faster load next time
                        me.productStorage[ product.productId ] = formattedProduct

                    })
                } else {
                    toastr.error('Could not get product detail for ' + product.name)
                }
            }, function (error) {
                console.error(error)
                toastr.error('Could not get product detail for ' + product.name)
            });
        }
    };


    //abstracts away remote call for detail
    me.getProductDetail = function (product) {
        return $http.get(constants.BWS_API + '/edit/products/' + product.productId)
    }


    //claim a product
    me.claim = function (options) {
        //options should have userId and productId
        if (!options.productId || !options.userId) {
            console.error('could not claim, wrong options')
        }
        if (options.status != 'done') {
            options.status = 'inprogress';
        }
        var payload = {
            "payload": options
        };
        log('claiming', payload);
        var url = constants.BWS_API + '/edit/claim';
        $http.post(url, payload).then(function (res) {
            toastr.info('You claimed product ' + options.productId);
            socket.emit('product-claimed', options);
            me.getStats();
            log('claim response', res)
        })
    };

    //remove a claim on a product
    me.removeClaim = function (options) {
        //options should have userId and productId
        if (!options.productId || !options.userId) {
            console.error('could not claim, wrong options')
        }
        options.status = 'new';
        var payload = {
            "payload": options
        };
        log('removing claim', payload);
        var url = constants.BWS_API + '/edit/claim';
        $http.put(url, payload).then(function (res) {
            log('claim response', res);
            socket.emit('product-unclaimed', options);
            me.currentProduct = {};
        }, function (err) {
            log('deleteClaim error', err);
            toastr.error('There was an error claiming this product.')
        })
    };

    me.save = function (product) {
        var defer = $q.defer();
        if (!product.productId) {
            console.error('save error: no productId specified %O', product)
            return
        }
        product.userId = me.userId;
        var payload = {
            payload: compareToCachedProduct(product)
        };
        var url = constants.BWS_API + '/edit/products/' + product.productId;
        $http.put(url, payload).then(onSaveSuccess, onSaveError);
        function onSaveSuccess(response) {
            console.log('onSaveSuccess %O', response);
            window.scrollTo(0, 0);
            socket.emit('product-saved');
            me.productStorage[ product.productId ] = product;
            toastr.success('Product Updated!')
            defer.resolve()
        }

        function onSaveError(error) {
            console.error('onSaveError %O', error);
            toastr.error('There was a problem updating product ' + product.productId)
            defer.reject()
        }

        return defer.promise
    };


    me.getStats = function () {
        me.productStats = {};

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
        product.name = product.title || product.displayName || product.name;
        product.notes = product.notes || product.text;
        product.properties.forEach(function (prop) {
            switch (prop.label) {
                case 'Requested By':
                    product.requestedBy = prop.value;
                    break;
                case 'Country':
                    prop.type = 'countryselect';
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
                    product.description = product.description || m.script;
                    product.audio = document.createElement('AUDIO');
                    product.audio.src = m.publicUrl;
                    product.audio.mediaAssetId = m.mediaAssetId;
                    product.audio.ontimeupdate = function setProgress() {
                        product.audio.progress = Number(product.audio.currentTime / product.audio.duration);
                    };
                    break;
                case 'IMAGE':
                    product.hasImages = true;
                    product.images = product.images || [];
                    product.images.mediaAssetId = m.mediaAssetId;
                    product.images.push(m)
            }
        });
        defer.resolve(product);

        return defer.promise;
    };

    me.uploadMedia = function (files) {
        var mediaConfig = {
            mediaRoute: 'media',
            folder:'products',
            type:'PRODUCT',
            fileType:'IMAGE',
            accountId: localStorage.getItem('accountId'),
            productId: me.currentProduct.productId
        }
        console.log('product config %0', mediaConfig)
        uploadService.upload(files[0], mediaConfig).then(function(response, err ){
            if(response) {
                toastr.success('Product Image Updated!');

                me.save(me.currentProduct).then(function (err, response) {
                    refreshProduct(me.currentProduct);

                })
            }
            else{
                toastr.error('Product Image Failed To Update!');
                console.log(err)
            }
        })

    };

    me.uploadAudio = function (files) {
        var mediaConfig = {
            mediaRoute: 'media',
            folder:'products',
            type:'PRODUCT',
            fileType:'AUDIO',
            accountId: localStorage.getItem('accountId'),
            productId: me.currentProduct.productId
        }
        console.log('product config %0', files)
        uploadService.upload(files[0], mediaConfig).then(function(response, err ){
            if(response) {
                toastr.success('Product Audio Updated!');

                me.save(me.currentProduct).then(function (err, response) {
                    refreshProduct(me.currentProduct);
                })

            }
            else{

                toastr.error('Product Audio Failed To Update!');
                console.log(err)
            }
        })

    };
    me.removeAudio = function(currentAudio){
            console.log('delete audio %O', currentAudio)
            var url = constants.API_URL + '/media/' + currentAudio;
            $http.delete(url).then(function () {
                toastr.success('audio removed', 'Success');

                me.save(me.currentProduct).then(function (err, response) {
                    refreshProduct(me.currentProduct);
                })
            })
    };
    me.removeImage= function(currentImage){
        console.log('delete image %O', currentImage)
        var url = constants.API_URL + '/media/' + currentImage.mediaAssetId;
        $http.delete(url).then(function () {
            toastr.success('image removed', 'Success');
            me.save(me.currentProduct).then(function (err, response) {
                refreshProduct(me.currentProduct);
            })
        })

    };
    function compareToCachedProduct(prod) {
        log('updatedProd', prod);
        log('cachedProd', cachedProduct);
        me.changes = [];
        if (prod.title !== cachedProduct.title) {
            me.changes.push('Changed title to ' + prod.title)
        }

        for (var i = 0; i < prod.properties.length; i++) {
            var updated = prod.properties[ i ];
            var cached = cachedProduct.properties[ i ];

            if (updated.value !== cached.value) {
                if (!cached.valueId) {
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

    var socket;
    if (window.io) {
        socket = io.connect(constants.BWS_API);
        socket.on('update', function (data) {
            console.log('UPDATING FOR SOCKETS')
            // me.updateProductList();
            me.getStats()
        });

        socket.on('update-claims', function (data) {
            console.log('UPDATING CLAIMS FOR SOCKETS ' + data.userId + data.productId);
            var i = _.findIndex(me.productList, function (p) {
                return p.productId == data.productId
            });
            me.productList[ i ].userId = data.userId;
            $rootScope.$apply()
        });

        socket.on('claim-removed', function (data) {
            console.log('UPDATING CLAIMS FOR SOCKETS ' + data.userId + data.productId);
            var i = _.findIndex(me.productList, function (p) {
                return p.productId == data.productId
            });
            me.productList[ i ].userId = null;
            $rootScope.$apply()
        })
    }

    function refreshProduct(product) {
        me.getProductDetail(product).then(function (res) {
            if (res.data.length > 0) {
                me.formatProductDetail(res.data[ 0 ]).then(function (formattedProduct) {
                    var p = formattedProduct;
                    log('formattedProduct', formattedProduct);
                    me.currentProduct = formattedProduct;

                    //cache current product for comparison
                    cachedProduct = jQuery.extend(true, {}, formattedProduct);

                    //store product for faster load next time
                    me.productStorage[ product.productId ] = formattedProduct

                })
            } else {
                toastr.error('Could not get product detail for ' + product.name)
            }
        })
    }


    me.init();


    return me;
});
