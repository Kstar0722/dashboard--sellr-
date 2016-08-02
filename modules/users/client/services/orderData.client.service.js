/* globals angular */
angular.module('users').factory('orderDataService', function ($http, $location, constants, Authentication, $stateParams, $q, toastr, $rootScope, uploadService, $timeout, productEditorService) {
  var me = this
  var API_URL = constants.BWS_API
  me.allItems = []
  me.selected = []
  me.getData = getData
  me.createNewProduct = createNewProduct
  me.matchProduct = matchProduct
  me.storeSelected = storeSelected
  me.increaseIndex = increaseIndex
  return me

  function getData (id) {
    var defer = $q.defer()
    me.currentIndex = 0
    console.log(id)
    var orderUrl = API_URL + '/edit/orders/' + id
    $http.get(orderUrl).then(function (response) {
      me.allItems = response.data[ 0 ].items
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
      'payload': {
        'duplicates': [],
        'sku': prod.upc,
        'publicUrl': prod.url
      }
    }
    for (var i in selected) {
      payload.payload.duplicates.push(selected[ i ].productId)
    }
    $http.post(skuUrl, payload).then(function (results) {
      // now update product status in mongo
      var updateUrl = constants.BWS_API + '/choose/orders/product/status'
      var updatePayload = {
        id: me.currentOrderId || $stateParams.id,
        upc: prod.upc,
        status: 'processed'
      }
      $http.put(updateUrl, { payload: updatePayload }).then(function (updateResults) {
        defer.resolve(results.data)
      }, function (err) {
        console.error(err)
      })
    }, function (err) {
      console.error('could not mark duplicate %O', err)
    })
    return defer.promise
  }

  function createNewProduct (prod) {
    var defer = $q.defer()
    var skuUrl = API_URL + '/edit/products'
    var payload = {
      'payload': {
        'name': prod.name,
        'description': prod.description,
        'notes': '',
        'productTypeId': prod.type,
        'requestedBy': 'sellr',
        'feedback': '0',
        'properties': [],
        'mediaAssets': [
          {
            'type': 'RESEARCH_IMG',
            'fileName': '',
            'script': null,
            'publicUrl': prod.url
          }
        ],
        'skus': [
          prod.upc
        ]
      }
    }
    console.log(payload)
    $http.post(skuUrl, payload).then(function (skuItems) {
      if (skuItems) {
        defer.resolve(skuItems)
      }
    })
    return defer.promise
  }
})
