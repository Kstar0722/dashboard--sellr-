angular.module('users').service('mergeService', function ($q, productEditorService, constants, $http) {
    var me = this;

    me.merge = merge;
    me.save = save;
    me.products = [];           //  array of products to be merged
    me.newProduct = {};         //  temporary object that combines all products
    me.finalProduct = {};       //  what the final product should look like
    me.prodsToDelete = [];        //  array of productIDs for API to delete

    function merge(products) {
        var defer = $q.defer();
        buildProductList(products).then(function (detailedProducts) {
            buildNewProduct(detailedProducts);
            mergeProductProperties();
            mergeProductMedia();
            buildFinalProduct();
            defer.resolve(me.newProduct)
        });
        return defer.promise;
    }

    function buildProductList(products) {
        var defer = $q.defer();
        products.forEach(function (p) {
            productEditorService.getProduct(p).then(function (productWithDetail) {
                me.products.push(productWithDetail);
                me.prodsToDelete.push(productWithDetail.productId)
            })
        }, onError);
        console.log('mergeService::me.products %O', me.products);
        defer.resolve(me.products);
        return defer.promise;
    }

    function buildNewProduct(products) {
        me.newProduct = {
            name: [],
            description: [],
            feedback: [],
            notes: [],
            productTypeId: [],
            requestedBy: [],
            skus: [],
            status: []
        };

        for (var prop in me.newProduct) {
            products.forEach(function (product) {
                if (product[ prop ]) {
                    if (me.newProduct[ prop ].indexOf(product[ prop ]) < 0) {
                        me.newProduct[ prop ].push(product[ prop ])
                    }
                }
            })
        }
        me.newProduct.skus = _.flatten(me.newProduct.skus)
    }

    function mergeProductProperties() {
        var properties = [];
        me.newProduct.properties = [];
        me.products.forEach(function (product) {
            product.properties.forEach(function (prop) {
                var i = _.findIndex(properties, function (p) {
                    return p.propId == prop.propId
                });
                if (i < 0) {
                    properties.push({
                        label: prop.label,
                        propId: prop.propId,
                        type: prop.type,
                        value: []
                    });
                    i = (properties.length - 1)
                }
                if (prop.value.length > 0) {
                    switch (prop.value.toLowerCase()) {
                        case 'na':
                            break;
                        case 'not-applicable':
                            break;
                        case 'not applicable':
                            break;
                        case 'not-vintage':
                            break;
                        case 'n/a':
                            break;
                        default:
                            properties[ i ].value.push(prop.value)
                            break;
                    }
                }

                properties[ i ].value = _.uniq(properties[ i ].value)

            })
        });
        me.newProduct.properties = properties;
        console.log('mergeProductProperties : %O', me.newProduct)
    }

    function buildFinalProduct() {
        //set first item in each array as default
        for (var prop in me.newProduct) {
            if (prop !== 'properties') {
                me.finalProduct[ prop ] = me.newProduct[ prop ][ 0 ]
            }
        }

        me.finalProduct.properties = [];
        me.finalProduct.mediaAssets = [];

        for (var i = 0; i < me.newProduct.properties.length; i++) {
            me.finalProduct.properties.push({
                label: me.newProduct.properties[ i ].label,
                propId: me.newProduct.properties[ i ].label,
                type: me.newProduct.properties[ i ].type,
                value: me.newProduct.properties[ i ].value[ 0 ]
            })
        }

        me.finalProduct.mediaAssets.push({
            type: 'AUDIO',
            publicUrl: me.newProduct.audio[ 0 ].src
        })

        me.newProduct.images.forEach(function (img) {
            me.finalProduct.mediaAssets.push({
                type: 'IMAGE',
                publicUrl: img.publicUrl,
                fileName: img.fileName
            })
        })


    }

    function mergeProductMedia() {
        var media = [];
        me.newProduct.mediaAssets = [];
        me.newProduct.images = [];
        me.newProduct.audio = [];

        me.products.forEach(function (product) {
            if (product.hasImages) {
                product.images.forEach(function (img) {
                    if (img.publicUrl) {
                        me.newProduct.images.push(img)
                    }
                })
            }
            if (product.audio) {
                me.newProduct.audio.push(product.audio)
            }
        })
        console.log('mergeProductMedia %O', me.newProduct)
    }


    function save() {
        for (var i = 0; i < me.finalProduct.properties.length; i++) {
            if (me.finalProduct.properties[ i ].value == undefined) {
                me.finalProduct.properties.splice(i, 1)
            }
        }
        me.finalProduct.note = 'Merged with ' + me.prodsToDelete.toString()
        var url = constants.BWS_URL + '/products/merge'
        var payload = {
            payload: {
                prodsToDelete: me.prodsToDelete,
                product: me.finalProduct
            }
        }
        debugger;


    }


    return me;
});


function onError(error) {
    console.error('Merge Service :: error :', error)
}
