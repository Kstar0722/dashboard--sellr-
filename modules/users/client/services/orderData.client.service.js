/* globals angular */
angular.module('users').factory('orderDataService', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout, productEditorService) {
  var me = this
  var API_URL = constants.BWS_API
  me.allItems = []
  me.selected = []
  me.allStores = []
  me.getData = getData
  me.createNewProduct = createNewProduct
  me.matchProduct = matchProduct
  me.storeSelected = storeSelected
  me.increaseIndex = increaseIndex
  me.decreaseIndex = decreaseIndex
  me.getAllStores = getAllStores

  $rootScope.$on('clearProductList', function () {
    me.selected = []
  })

  function getAllStores (filter) {
    var defer = $q.defer()
    var url = constants.BWS_API + '/storedb/stores?supc=true'
    if (filter && filter.accountId) url += '&account=' + filter.accountId;
    $http.get(url).then(function (response) {
      me.allStores = response.data
      defer.resolve(me.allStores)
    }, function (err) {
      console.log('Could not getAllStores %O', err)
      defer.reject(err)
    })
    return defer.promise
  }

  function getData (store, status) {
    var defer = $q.defer()
    me.currentStore = store
    me.currentIndex = 0
    var orderUrl = API_URL + '/storedb/stores/products?supc=true&id=' + store.storeId
    if (status) orderUrl += '&status=' + status;
    $http.get(orderUrl).then(function (response) {
      me.allItems = _.map(response.data, function (prod) {
        switch (prod.productTypeId) {
          case 1:
            prod.type = 'Wine'
            break
          case 2:
            prod.type = 'Beer'
            break
          case 3:
            prod.type = 'Spirits'
            break
          default:
            prod.type = 'Unknown Type'
            break
        }
        return prod
      })
      me.currentItem = me.allItems[ me.currentIndex ]
      console.log('orderDataService::getData response %O', me.allItems)
      defer.resolve(me.allItems)
    })
    return defer.promise
  }

  function increaseIndex () {
    me.selected = []
    if (me.currentIndex + 1 === me.allItems.length) {
      me.currentIndex = 0
    } else {
      me.currentIndex++
    }
    me.currentItem = me.allItems[ me.currentIndex ]
  }

  function decreaseIndex () {
    me.selected = []
    if ((me.currentIndex - 1) < 0) {
      me.currentIndex = (me.allItems.length - 1)
    } else {
      me.currentIndex--
    }
    me.currentItem = me.allItems[ me.currentIndex ]
  }

  function storeSelected (selected) {
    me.selected = selected
    return me.selected
  }

  function matchProduct () {
    var prod = me.currentItem
    var selected = me.selected
    var defer = $q.defer()
    var skuUrl = API_URL + '/edit/sku'
    var payload = {
      duplicates: [],
      sku: prod.upc
    }
    if (prod.url) {
      payload.publicUrl = prod.url
    }
    for (var i in selected) {
      payload.duplicates.push(selected[ i ].productId)
    }
    $http.post(skuUrl, { payload: payload }).then(function (results) {
      me.currentItem.productId = me.selected[ 0 ].productId
      console.log('orderDataService[matchProduct] %O', results)
      defer.resolve(me.selected[ 0 ])
    }, function (err) {
      console.error('could not mark duplicate %O', err)
    })
    return defer.promise
  }

  function createNewProduct (prod) {
    var defer = $q.defer()
    var skuUrl = API_URL + '/edit/products'
    var payload = {
      name: prod.name,
      description: prod.description,
      notes: '',
      productTypeId: prod.productTypeId,
      requestedBy: me.currentStore.name || 'sellr',
      feedback: '0',
      properties: [],
      mediaAssets: [],
      'skus': [
        prod.upc
      ]
    }
    if (prod.url) {
      payload.mediaAssets.push({
        'type': 'RESEARCH_IMG',
        'fileName': '',
        'script': null,
        'publicUrl': prod.url
      })
    }
    console.log(payload)
    $http.post(skuUrl, { payload: payload }).then(function (response) {
      console.log('orderDataService[createNewProduct] %O', response)
      defer.resolve(response)
    }, function (err) {
      console.error('orderDataService[createNewProduct] %O', err)
      defer.reject(err)
    })
    return defer.promise
  }

  return me
})
