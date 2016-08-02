/* globals angular, localStorage,jQuery,_ */
angular.module('users').service('productEditorService', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout) {
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
    loading: true
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

  function getAvailProdSuccess (response) {
    if (response.status === 200) {
      //timeEnd('getProductList');
      me.show.loading = false;
      log('getProdList ', response.data);
      me.getStats();
      response.data = _.map(response.data, function (product) {
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

      if (options.status) {
        url += '&status=' + JSON.stringify(options.status).replace(/"/g, '')
      }
      if (searchText) {
        url += '&q=' + searchText + '&v=sum'
      }
      $http.get(url).then(function (response) {
        me.productList = response.data
        me.show.loading = false
        defer.resolve(me.productList)
      })
      return defer.promise
    }
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
    me.currentProduct = {}
    cachedProduct = {}
    me.changes = []
    me.getProduct(product).then(function (formattedProduct) {
      formattedProduct.userId = product.userId
      me.currentProduct = formattedProduct
      //  cache current product for comparison
      cachedProduct = jQuery.extend(true, {}, formattedProduct)
    })
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
    $http.post(url, payload).then(function (res) {
      toastr.info('User ' + options.username + ' claimed product ' + options.productId)
      // socket.emit('product-claimed', options)
      me.getStats()
      log('claim response', res)
    }, function (err) {
      toastr.error('There was a problem claiming this product')
      console.error(err)
    })
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
      cachedProduct = jQuery.extend(true, {}, me.productStorage[ product.productId ]);
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
    products.forEach(function (product) {
      cachedProduct = jQuery.extend(true, {}, product)
      product.properties = []
      product.status = status
      me.save(product)
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
    var mediaConfig = {
      mediaRoute: 'media',
      folder: 'products',
      type: 'PRODUCT',
      fileType: 'IMAGE',
      accountId: localStorage.getItem('accountId'),
      productId: me.currentProduct.productId
    }
    // log('product config %0', mediaConfig)
    uploadService.upload(files[ 0 ], mediaConfig).then(function (response, err) {
      if (response) {
        toastr.success('Product Image Updated!')
        me.save(me.currentProduct).then(function (err, response) {
          if (err) {
            toastr.error('There was a problem uploading this image.')
          }
          refreshProduct(me.currentProduct)
        })
      } else {
        toastr.error('Product Image Failed To Update!')
      }
    })
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
    $http.post(url, payload).then(function (res) {
      console.log(res)
    }, function (err) {
      console.error(err)
    })
    }

  me.searchSkuResults = function (sku) {
    var defer = $q.defer()
    me.show.loading = true
    var skuUrl = constants.BWS_API + '/edit/search?v=sum&q=' + sku
    $http.get(skuUrl).then(function (skuResult) {
      var remainingQueries = skuResult.data.length
      if (remainingQueries) {
        console.log('I have to query %s names', remainingQueries)
        for (var i in skuResult.data) {
          var url = constants.BWS_API + '/edit/search?v=sum&q=' + skuResult.data[ i ].name
          $http.get(url).then(function (results2) {
            me.productList = me.productList.concat(results2.data)
            me.productList = _.uniq(me.productList, function (p) {
              return p.productId
            })
            remainingQueries--
            console.log('1 down, %s to go', remainingQueries)
            if (remainingQueries <= 0) {
              me.show.loading = false
              defer.resolve(me.productList)
            }
            })
        }
      } else {
        me.show.loading = false;
        defer.resolve()
        }
    })
    return defer.promise
  }

  me.createNewProduct = function (product) {
    me.newProduct = product
  }

  me.init()

  return me
})


