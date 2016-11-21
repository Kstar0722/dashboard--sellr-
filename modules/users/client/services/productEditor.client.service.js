/* globals angular, localStorage,jQuery,_ */
angular.module('users').service('productEditorService', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout, $filter) {
  var me = this
  var debugLogs = false
  var log = function (title, data) {
    if (debugLogs) {
      title += '%O'
      console.log(title, data)
    }
  }
  var cachedProduct
  me.changes = []
  if (localStorage.getItem('userId')) {
    me.userId = localStorage.getItem('userId')
  }
  me.show = {
    loading: true,
    newProducts: false
  }
  if (localStorage.getItem('edit-account')) {
    me.currentAccount = localStorage.getItem('edit-account')
  } else {
    me.currentAccount = ''
  }

  me.init = function () {
    me.productTypes = [ { name: 'wine', productTypeId: 1 }, { name: 'beer', productTypeId: 2 }, {
      name: 'spirits',
      productTypeId: 3
    } ]
    me.productStatuses = [
      { name: 'Available', value: 'new' },
      { name: 'In Progress', value: 'inprogress' },
      { name: 'Done', value: 'done' },
      { name: 'Approved', value: 'approved' }
    ]
    me.productStorage = {}
    me.productStats = {}
    me.allProducts = []
    me.newProducts = []
    me.productList = []
    me.myProducts = []
    me.currentProduct = {}
    me.currentType = {}
    me.currentStatus = {}
    me.newProduct = {}

    // initialize with new products so list isnt empty

    getProductEditors()
    me.show.loading = false
  }

  me.getProductList = function (searchText, options) {
    me.show.loading = true
    var defer = $q.defer()
    me.productList = []
    me.allProducts = []
    var url = constants.BWS_API + '/edit/search?'
    if (options.types) {
      for (var i in options.types) {
        url += '&type=' + options.types[ i ].type
      }
    }
    if (options.name) {
      url += '&name=' + options.name + '&des=' + options.name
    }
    if (options.sku) {
      url += '&sku=' + options.sku
    }

    if (options.status) {
      url += '&status=' + JSON.stringify(options.status).replace(/"/g, '')
    }
    if (options.store) {
      url += '&store=' + options.store.storeId
    }
    // if (options.store) {
    //   if (options.stores[ 0 ]) {
    //     url += '&store=' + options.stores[ 0 ]
    //     for (var k = 1; k < options.stores.length; k++) {
    //       url += ',' + options.stores[ k ]
    //     }
    //   }
    // }
    if (searchText) {
      url += '&q=' + searchText
    }
    url += '&v=sum'
    console.log('getting URL: ', url)
    $http.get(url).then(function (response) {
      me.productList = response.data
      me.allProducts = response.data
      me.show.loading = false
      defer.resolve(me.productList)
    }, function (err) {
      console.error('could not get product list %O', err)
      defer.reject(err)
      me.show.loading = false
    })
    return defer.promise
  }

  me.sortAndFilterProductList = function (listOptions) {
    me.allProducts = $filter('orderBy')(me.allProducts, listOptions.orderBy)
    me.productList = me.allProducts
    if (listOptions.filterByUserId) {
      me.productList = $filter('filter')(me.productList, { userId: listOptions.userId })
    }
    me.productList = $filter('limitTo')(me.productList, listOptions.searchLimit)
  }

  // send in type,status,userid, get back list of products
  me.getMyProducts = function (options) {
    options = options | {}
    if (!options.type || !options.status || !options.userId) {
      options = {
        type: me.currentType.productTypeId,
        status: me.currentStatus.value,
        userId: me.userId
      }
    }
    var url = constants.BWS_API + '/edit?status=' + options.status + '&type=' + options.type + '&user=' + options.userId
    $http.get(url).then(getMyProdSuccess, getMyProdError)

    function getMyProdSuccess (response) {
      if (response.status === 200) {
        me.productList = response.data
      }
    }

    function getMyProdError (error) {
      console.error('getMyProdError %O', error)
    }
  }

  //  abstracts away remote call for detail
  me.getProductDetail = function (product) {
    return $http.get(constants.BWS_API + '/edit/products/' + product.productId)
  }

  me.getProduct = function (product) {
    var defer = $q.defer()
    if (!product.productId) {
      defer.reject({ message: 'no product Id' })
    }
    if (me.productStorage[ product.productId ]) {
      //  use cached product if exists
      cachedProduct = jQuery.extend(true, {}, me.productStorage[ product.productId ])
      defer.resolve(me.productStorage[ product.productId ])
    } else {
      //  get from api and format
      me.getProductDetail(product).then(function (res) {
        if (res.data.length > 0) {
          me.formatProductDetail(res.data[ 0 ]).then(function (formattedProduct) {
            log('formattedProduct', formattedProduct)
            // store product for faster load next time
            me.productStorage[ product.productId ] = formattedProduct
            //  cache current product for comparison
            cachedProduct = jQuery.extend(true, {}, formattedProduct)
            defer.resolve(formattedProduct)
          })
        } else {
          var error = { message: 'Could not get product detail for ' + product.name }
          toastr.error(error.message)
          defer.reject(error)
        }
      }, function (error) {
        // error(error)
        toastr.error('Could not get product detail for ' + product.name)
        defer.reject(error)
      })
    }
    return defer.promise
  }

  // calls get detail from API and caches product
  me.setCurrentProduct = function (product) {
    var defer = $q.defer()
    me.currentProduct = {}
    cachedProduct = {}
    me.changes = []
    me.getProduct(product).then(function (formattedProduct) {
      formattedProduct.userId = product.userId
      me.currentProduct = formattedProduct
      defer.resolve(me.currentProduct)
    })
    return defer.promise
  }

  //  claim a product
  me.claim = function (options) {
    // options should have userId and productId
    if (!options.productId || !options.userId) {
      // error('could not claim, wrong options')
    }
    if (options.status !== 'done') {
      options.status = 'inprogress'
    }
    var payload = {
      'payload': options
    }
    log('claiming', payload)
    var url = constants.BWS_API + '/edit/claim'
    return $http.post(url, payload)
  }

  me.clearProductList = function () {
    me.productList = []
    $rootScope.$broadcast('clearProductList')
  }

  // remove a claim on a product
  me.removeClaim = function (options) {
    // options should have userId and productId
    if (!options.productId || !options.userId) {
      // error('could not claim, wrong options')
    }
    options.status = 'new'
    var payload = {
      'payload': options
    }
    log('removing claim', payload)
    var url = constants.BWS_API + '/edit/claim'
    $http.put(url, payload).then(function (res) {
      log('claim response', res)
      // socket.emit('product-unclaimed', options)
      me.currentProduct = {}
    }, function (err) {
      log('deleteClaim error', err)
      toastr.error('There was an error claiming this product.')
    })
  }

  me.save = function (product) {
    var defer = $q.defer()
    if (!product.productId) {
      return
    }
    product.userId = me.userId
    if (!product.userId) {
      if (localStorage.getItem('userId')) {
        me.userId = localStorage.getItem('userId')
        product.userId = me.userId
      }
    }
    if (!product.userId) {
      toastr.error('There was a problem saving this product. Please sign out and sign in again.')
      return
    }
    var payload = {
      payload: compareToCachedProduct(product)
    }
    var url = constants.BWS_API + '/edit/products/' + product.productId
    $http.put(url, payload).then(onSaveSuccess, onSaveError)
    function onSaveSuccess (response) {
      window.scrollTo(0, 0)
      // socket.emit('product-saved')
      me.productStorage[ product.productId ] = product
      cachedProduct = jQuery.extend(true, {}, me.productStorage[ product.productId ])
      toastr.success('Product Updated!')
      defer.resolve()
    }

    function onSaveError (error) {
      console.error('onSaveError %O', error)
      toastr.error('There was a problem updating product ' + product.productId)
      defer.reject()
    }

    return defer.promise
  }

  me.bulkUpdateStatus = function (products, status) {
    products.forEach(function (p) {
      me.getProduct(p).then(function (product) {
        cachedProduct = jQuery.extend(true, {}, product)
        // blank prop arrays tells api to only update status
        product.properties = []
        product.status = status
        me.save(product)
      })
    })
  }

  me.getStats = function () {
    var account = me.currentAccount

    var url = constants.BWS_API + '/edit/count'
    if (account) {
      url += '?requested_by=' + account
    }
    $http.get(url).then(onGetStatSuccess, onGetStatError)
    function onGetStatSuccess (response) {
      // log('onGetStatSuccess %O', response)
      me.productStats = response.data
      me.currentAccount = account
    }

    function onGetStatError (error) {
      console.error('onGetStatError %O', error)
      me.productStats = {}
    }
  }

  me.formatProductDetail = function (product) {
    var defer = $q.defer()
    product.name = product.title || product.displayName || product.name
    product.notes = product.notes || product.text
    try {
      product.feedback = JSON.parse(product.feedback)
    } catch (e) {
      product.feedback = []
    }
    product.properties.forEach(function (prop) {
      switch (prop.label) {
        case 'Requested By':
          product.requestedBy = prop.value
          break
        case 'Country':
          prop.type = 'countryselect'
          break
        case 'Script':
          prop.type = 'textarea'
          break
        case 'Description':
          prop.type = 'textarea'
          break
        case 'foodpairing':
          prop.type = 'textarea'
          break
        default:
          prop.type = 'input'
          break
      }
    })
    product.mediaAssets.forEach(function (m) {
      switch (m.type) {
        case 'AUDIO':
          product.description = product.description || m.script
          if (m.publicUrl) {
            if (m.publicUrl.length > 1) {
              product.audio = document.createElement('AUDIO')
              product.audio.src = m.publicUrl
              product.audio.mediaAssetId = m.mediaAssetId
              product.audio.ontimeupdate = function setProgress () {
                product.audio.progress = Number(product.audio.currentTime / product.audio.duration)
              }
            }
          }
          break
        case 'IMAGE':
          product.hasImages = true
          product.images = product.images || []
          product.images.mediaAssetId = m.mediaAssetId
          product.images.push(m)
          break
        case 'RESEARCH_IMG':
          product.hasRearchImg = true
          product.researchImages = product.researchImages || []
          product.researchImages.mediaAssetId = m.mediaAssetId
          product.researchImages.push(m)
          break
      }
    })
    if (product.description && !product.description.match(/[<>]/)) {
      product.description = '<p>' + product.description + '</p>'
    }
    defer.resolve(product)

    return defer.promise
  }

  me.uploadMedia = function (files) {
    if (_.isEmpty(files)) {
      return
    }
    var defer = $q.defer()
    var mediaConfig = {
      mediaRoute: 'media',
      folder: 'products',
      type: 'PRODUCT',
      fileType: 'IMAGE',
      accountId: localStorage.getItem('accountId'),
      productId: me.currentProduct.productId
    }
    uploadService.upload(files[ 0 ], mediaConfig).then(function (response, err) {
      if (response) {
        toastr.success('Product Image Updated!')
        me.save(me.currentProduct).then(function (err, response) {
          if (err) {
            toastr.error('There was a problem uploading this image.')
          }
          refreshProduct(me.currentProduct)
          defer.resolve(response)
        })
      } else {
        toastr.error('Product Image Failed To Update!')
      }
    })
    return defer.promise
  }

  me.uploadAudio = function (files) {
    var mediaConfig = {
      mediaRoute: 'media',
      folder: 'products',
      type: 'PRODUCT',
      fileType: 'AUDIO',
      accountId: localStorage.getItem('accountId'),
      productId: me.currentProduct.productId
    }
    // log('product config %0', files)
    uploadService.upload(files[ 0 ], mediaConfig).then(function (response, err) {
      if (response) {
        toastr.success('Product Audio Updated!')

        me.save(me.currentProduct).then(function (err, response) {
          if (err) {
            toastr.error('There was a problem uploading audio')
          }
          refreshProduct(me.currentProduct)
        })
      } else {
        toastr.error('Product Audio Failed To Update!')
      }
    })
  }
  me.removeAudio = function (currentAudio) {
    // log('delete audio %O', currentAudio)
    var url = constants.API_URL + '/media/' + currentAudio
    $http.delete(url).then(function () {
      toastr.success('audio removed', 'Success')
      me.save(me.currentProduct).then(function (err, response) {
        if (err) {
          toastr.error('There was a problem removing audio')
        }
        refreshProduct(me.currentProduct)
      })
    })
  }
  me.removeImage = function (currentImage) {
    // log('delete image %O', currentImage)
    var url = constants.API_URL + '/media/' + currentImage.mediaAssetId
    $http.delete(url).then(function () {
      toastr.success('image removed', 'Success')
      me.save(me.currentProduct).then(function (err, response) {
        if (err) {
          toastr.error('There was a problem removing image')
        }
        refreshProduct(me.currentProduct)
      })
    })
  }

  function compareToCachedProduct (prod) {
    log('updatedProd', prod)
    log('cachedProd', cachedProduct)
    me.changes = []
    if (prod.title && prod.title !== cachedProduct.title) {
      me.changes.push('Changed title to ' + prod.title)
    }
    if (prod.status && prod.status !== cachedProduct.status) {
      me.changes.push('Changed status to ' + prod.status)
    }
    if (prod.properties) {
      for (var i = 0; i < prod.properties.length; i++) {
        var updated = prod.properties[ i ]
        var cached = cachedProduct.properties[ i ]

        if (updated.value !== cached.value) {
          if (!cached.valueId) {
            updated.changed = 'new'
            me.changes.push('Added ' + updated.label + ' as ' + updated.value)
          } else {
            updated.changed = 'update'
            me.changes.push('Updated ' + updated.label + '. Changed ' + '"' + cached.value + '"' + ' to ' + '"' + updated.value + '"')
          }
        } else {
          updated.changed = 'false'
        }
      }
      log('changes added', prod)
      return (prod)
    } else {
      return prod
    }
  }

  function refreshProduct (product) {
    me.getProductDetail(product).then(function (res) {
      if (res.data.length > 0) {
        me.formatProductDetail(res.data[ 0 ]).then(function (formattedProduct) {
          log('formattedProduct', formattedProduct)
          me.currentProduct = formattedProduct

          // cache current product for comparison
          cachedProduct = jQuery.extend(true, {}, formattedProduct)

          // store product for faster load next time
          me.productStorage[ product.productId ] = formattedProduct
        })
      } else {
        toastr.error('Could not get product detail for ' + product.name)
      }
    })
  }

  function getProductEditors () {
    var url = constants.API_URL + '/users/editors'
    $http.get(url).then(function (res) {
      console.log('gotProductEditors %O', res)
      me.productEditors = res.data
    }, function (err) {
      console.error('Error with getProductEditor: %O', err)
    })
  }

  me.updateFeedback = function (feedback) {
    var url = constants.BWS_API + '/edit/feedback'
    var payload = {
      payload: {
        productId: me.currentProduct.productId,
        feedback: feedback
      }
    }
    return $http.post(url, payload).then(function (res) {
      console.log(res)
    }, function (err) {
      console.error(err)
    })
  }

  me.deleteFeedback = function (feedback) {
    var product = me.currentProduct
    var feedbackId = feedback.id || _.indexOf(product.feedback, feedback) + 1
    var url = constants.BWS_API + '/edit/feedback?productId=' + product.productId + '&feedbackId=' + feedbackId
    return $http.delete(url).then(function (res) {
      console.log(res)
    }, function (err) {
      console.error(err)
      throw err
    })
  }

  me.searchSkuResults = function (options) {
    var defer = $q.defer()
    var sku = options.upc
    var type = options.type
    console.log('searching sku %s', sku)
    me.show.loading = true
    var skuUrl = constants.BWS_API + '/edit/search?l=50&type=' + type + '&v=sum&sku=' + sku
    $http.get(skuUrl).then(function (skuResult) {
      me.remainingQueries = skuResult.data.length
      if (me.remainingQueries > 0) {
        me.productList = options.productList || []
        console.log('I have to query %s names', me.remainingQueries)
        for (var i in skuResult.data) {
          me.productList = me.productList.concat(skuResult.data[ i ])
          if (skuResult.data[ i ].name.toLowerCase() === 'na') {
            me.remainingQueries--
            console.log('skipping na results')
            if (me.remainingQueries <= 0) {
              me.show.loading = false
              defer.resolve(me.productList)
            }
          } else {
            var url = constants.BWS_API + '/edit/search?l=50&type=' + type + '&v=sum&name=' + skuResult.data[ i ].name
            $http.get(url).then(function (results2) {
              me.productList = me.productList.concat(results2.data)
              me.productList = _.uniq(me.productList, function (p) {
                return p.productId
              })
              me.remainingQueries--
              console.log('1 down, %s to go', me.remainingQueries)
              if (me.remainingQueries <= 0) {
                me.show.loading = false
                defer.resolve(me.productList)
              }
            })
          }
        }
      } else {
        me.productList = options.productList
        me.show.loading = false
        defer.resolve(me.productList)
      }
    }, function (err) {
      console.error('Could not search sku results %O', err)
      defer.reject(err)
    })
    return defer.promise
  }

  me.createNewProduct = function (product) {
    me.newProduct = product
  }

  me.checkForNewProducts = function () {
    var url = constants.BWS_API + '/edit/search?status=new&v=sum'
    $http.get(url).then(function (res) {
      me.show.newProducts = res.data.length > 0
      me.newProducts = res.data
    })
  }

  me.viewNewProducts = function (limit) {
    // This is to allow Controller to display their own custom loading animation
    var defer = $q.defer()
    me.productList = $filter('limitTo')(me.newProducts, limit)
    $timeout(function () {
      defer.resolve()
    }, 600)
    return defer.promise
  }

  me.deleteProductSKU = function (product, sku) {
    var params = {
      productId: product.productId,
      sku: sku
    };
    return $http.delete(constants.BWS_API + '/edit/sku', { params: params }).then(function (res) {
      _.removeItem(me.currentProduct.skus, sku);
      toastr.success('UPC ' + sku + ' removed');
    }).catch(function (err) {
      console.error(err.data);
      toastr.error('Failed to remove product SKU ' + sku);
      throw err;
    });
  };

  me.init()

  return me
})
