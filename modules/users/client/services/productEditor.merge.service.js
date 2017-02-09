/* globals angular, _ */
angular.module('users').service('mergeService', function ($q, productEditorService, constants, $http, $state, toastr, $rootScope, $stateParams) {
  var me = this

  me.merge = merge
  me.save = save
  me.products = [] //  array of products to be merged
  me.newProduct = {} //  temporary object that combines all products
  me.finalProduct = {} //  what the final product should look like
  me.prodsToDelete = [] //  array of productIDs for API to delete

  function merge (products) {
    var defer = $q.defer()
    me.products = [] //  array of products to be merged
    me.newProduct = {} //  temporary object that combines all products
    me.finalProduct = {} //  what the final product should look like
    me.prodsToDelete = [] //  array of productIDs for API to delete
    buildProductList(products).then(function (detailedProducts) {
      buildNewProduct(detailedProducts)
      mergeProductProperties()
      mergeProductMedia()
      buildFinalProduct()
      defer.resolve(me.newProduct)
    })
    return defer.promise
  }

  function buildProductList (products) {
    var defer = $q.defer()
    var remaining = products.length
    products.forEach(function (p) {
      productEditorService.getProduct(p).then(function (productWithDetail) {
        me.products.push(productWithDetail)
        me.prodsToDelete.push(productWithDetail.productId)
        remaining--
        if (remaining === 0) {
          console.log('mergeService::buildProductList %O', me.products)
          $rootScope.$broadcast('clearProductList')
          defer.resolve(me.products)
        }
      })
    }, onError)
    return defer.promise
  }

  function buildNewProduct (products) {
    me.newProduct = {
      name: [],
      description: [],
      feedback: [],
      notes: [],
      productTypeId: [],
      requestedBy: [],
      skus: []
    }

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
    console.log('mergeService::buildNewProduct')
  }

  function mergeProductProperties () {
    var properties = []
    me.newProduct.properties = []
    me.products.forEach(function (product) {
      product.properties.forEach(function (prop) {
        if (prop.visibility) {
          var i = _.findIndex(properties, function (p) {
            return p.propId === prop.propId
          })
          if (i < 0) {
            properties.push({
              label: prop.label,
              propId: prop.propId,
              type: prop.type,
              visibility: prop.visibility,
              value: []
            })
            i = (properties.length - 1)
          }
          if (prop.value.length > 0) {
            switch (prop.value.toLowerCase()) {
              case 'na':
                break
              case 'not-applicable':
                break
              case 'not applicable':
                break
              case 'not-vintage':
                break
              case 'n/a':
                break
              default:
                properties[ i ].value.push(prop.value)
                break
            }
          }
          properties[ i ].value = _.uniq(properties[ i ].value)
        }
      })
    })
    me.newProduct.properties = properties
    console.log('mergeService::mergeProductProperties : %O', me.newProduct)
  }

  function buildFinalProduct () {
    // set first item in each array as default
    for (var prop in me.newProduct) {
      if (prop !== 'properties' && prop !== 'skus') {
        me.finalProduct[ prop ] = me.newProduct[ prop ][ 0 ]
      }
    }

    me.finalProduct.skus = me.newProduct.skus

    me.finalProduct.properties = []
    me.finalProduct.mediaAssets = []

    for (var i = 0; i < me.newProduct.properties.length; i++) {
      me.finalProduct.properties.push({
        label: me.newProduct.properties[ i ].label,
        propId: me.newProduct.properties[ i ].propId,
        type: me.newProduct.properties[ i ].type,
        value: me.newProduct.properties[ i ].value[ 0 ]
      })
    }
    console.log('mergeService::buildFinalProduct')
  }

  function mergeProductMedia () {
    me.newProduct.mediaAssets = []
    me.newProduct.images = []
    me.newProduct.audio = []

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
    console.log('mergeService::mergeProductMedia %O', me.newProduct)
  }

  me.refreshProductImage = function (imgObj) {
    if (imgObj.publicUrl) {
      me.newProduct.images.push(imgObj)
    }
  }

  function save () {
    for (var i = 0; i < me.finalProduct.properties.length; i++) {
      if (me.finalProduct.properties[ i ].value === undefined) {
        me.finalProduct.properties.splice(i, 1)
      }
    }
    me.finalProduct.notes = 'Merged with ' + me.prodsToDelete.toString()
    if (me.newProduct.audio.length > 0) {
      me.finalProduct.mediaAssets.push(me.newProduct.audio[ 0 ].mediaAssetId)
    }
    me.newProduct.images.forEach(function (img) {
      me.finalProduct.mediaAssets.push(img.mediaAssetId)
    })

    me.finalProduct.status = 'done'
    var url = constants.BWS_API + '/products/merge'
    var payload = {
      payload: {
        prodsToDelete: me.prodsToDelete,
        product: me.finalProduct
      }
    }
    $http.post(url, payload).then(function (res) {
      if (res.data.productId) {
        toastr.success('Product Merged!')
        if ($state.includes('editor.match.merge')) {
          $state.go('editor.match.view', { productId: res.data.productId, status: $stateParams.status }, { reload: true })
        } else {
          $state.go('editor.view', { productId: res.data.productId, status: $stateParams.status }, { reload: true })
        }
      } else {
        console.error('No productId returned from server %O', res)
        toastr.error('There was a problem with merging')
      }
    }, function (err) {
      console.error(err)
    })
  }

  return me
})

function onError (error) {
  console.error('Merge Service :: error :', error)
}
