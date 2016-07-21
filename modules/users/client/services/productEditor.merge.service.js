angular.module('users').service('mergeService', function ($q, productEditorService) {
    var me = this;

    me.merge = merge;
    me.products = [];           //  array of products to be merged
    me.newProduct = {};         //  temporary object that combines all products
    me.finalProduct = {};       //  what the final product should look like

    function merge(products) {
        var defer = $q.defer()
        buildProductList(products).then(function (detailedProducts) {
            buildNewProduct(detailedProducts);
            mergeProductProperties();
            buildFinalProduct()
            defer.resolve(me.newProduct)
        })
        return defer.promise;
    }

    function buildProductList(products) {
        var defer = $q.defer()
        products.forEach(function (p) {
            productEditorService.getProduct(p).then(function (productWithDetail) {
                me.products.push(productWithDetail)
            })
        }, onError);
        console.log('mergeService::me.products %O', me.products);
        defer.resolve(me.products)
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
    }

    function mergeProductProperties() {
        var properties = {};
        me.newProduct.properties = []
        me.products.forEach(function (product) {
            product.properties.forEach(function (prop) {
                if (!properties[ prop.propId ]) {
                    properties[ prop.propId ] = []
                    properties[ prop.propId ].push({
                        label: prop.label,
                        propId: prop.propId,
                        type: prop.type,
                        value: []
                    })
                }
                if (prop.value.toLowerCase() != 'na') {
                    properties[ prop.propId ].value.push(prop.value)
                }
            })
        });

        debugger;

        //remove duplicate properties

        properties = _.toArray(properties);
        properties.forEach(function (prop) {
            var dedupProp = _.uniq(prop, function (p) {
                return p.value
            });

            me.newProduct.properties.push(dedupProp)
        });


        console.log('mergeProductProperties : %O', me.newProduct)
    }

    function buildFinalProduct() {
        //set first item in each array as default
        for (var prop in me.newProduct) {
            me.finalProduct[ prop ] = me.newProduct[ prop ][ 0 ]
        }
    }


    return me;
});


function onError(error) {
    console.error('Merge Service :: error :', error)
}
