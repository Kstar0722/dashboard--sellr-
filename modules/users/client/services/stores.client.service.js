/* globals angular, localStorage */
angular.module('users').service('storesService', function ($http, constants, $q, toastr, $state) {
  var me = this

  me.getStoreById = function (storeId) {
    return $http.get(constants.BWS_API + '/storedb/stores/' + storeId + '?supc=true').then(handleResponse).then(function (data) {
      return data instanceof Array ? data[ 0 ] : data
    })
  }

  me.createStore = function (store) {
    return $http.post(constants.BWS_API + '/storedb/stores', { payload: store }).then(handleResponse)
  }

  me.importStoreProducts = function (store, storeItems) {
    if (!store) return $q.reject('no store db found in csv file')

    var payload = {
      id: store.storeId,
      accountId: store.accountId,
      items: storeItems,
      source: 'csv'
    }

    return $http.post(constants.BWS_API + '/storedb/stores/products/import', { payload: payload }).then(handleResponse)
  }

  function handleResponse (response) {
    if (response.status !== 200) throw Error(response.statusText)
    var data = response.data
    if (data.error) {
      console.error(data.error)
      throw Error(data.message || data.error)
    }
    return data
  }

  // BELOW IS COPIED FROM OLD LOCATIONS SERVICE BUT REWORKED to new Store db URLS
  me.stores = []
  me.editStore = {}
  me.accountId = localStorage.getItem('accountId')

  me.getStores = function () {
    var defer = $q.defer()
    me.stores = []
    var url = constants.BWS_API + '/storedb/stores?info=true&acc=' + me.accountId
    $http.get(url).then(function (res) {
      console.log('storesService getStores %O', res.data)
      me.stores = res.data
      defer.resolve()
    })
    return defer.promise
  }

  me.createStoreManager = function (store) {
    console.log(store)
    $http.post(constants.BWS_API + '/storedb/stores', { payload: store }).then(onAPISuccess.bind(this, 'create'), onAPIError.bind(this, 'create'))
  }

  me.updateStore = function (store) {
    var payload = {
      payload: store
    }
    $http.put(constants.BWS_API + '/storedb/stores/details', payload).then(onAPISuccess.bind(this, 'update'), onAPIError.bind(this, 'update'))
  }

  me.deleteStore = function (storeId) {
    var url = constants.BWS_API + '/storedb/stores/' + storeId
    $http.delete(url).then(onAPISuccess.bind(this, 'delete'), onAPIError.bind(this, 'delete'))
  }

  // API RESPONSE/ERROR HANDLING
  function onAPISuccess (operation) {
    me.getStores().then(function () {
      switch (operation) {
        case 'create':
          toastr.success('New Store Created', 'Success!')
          break
        case 'delete':
          toastr.success('Store deleted', 'Success!')
          break
        case 'update':
          toastr.success('Store Updated', 'Success!')
          break
        default:
          break
      }
      $state.go('manager.stores')
    })
  }

  function onAPIError (operation) {
    switch (operation) {
      case 'create':
        toastr.error('The Store could not be created', 'Error')
        break
      case 'delete':
        toastr.error('The Store could not be deleted', 'Error')
        break
      case 'update':
        toastr.error('The Store could not be udpated', 'Error')
        break
      default:
        break
    }
  }

  return me
})
