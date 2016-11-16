/* globals angular, localStorage */
angular.module('users').service('storesService', function ($http, constants, $q, toastr) {
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

  // BELOW IS COPIED FROM OLD LOCATIONS SERVICE
  me.init = function () {
    var defer = $q.defer()
    me.stores = []
    me.accountId = localStorage.getItem('accountId')
    me.editLocation = {}
    me.getStores()

    defer.resolve()
    return defer.promise
  }

  // MAIN CRUD OPERATIONS, Create, Get, Update, Delete

  me.createLocation = function (location) {
    console.log('location service location object %O', location)
    var url = constants.API_URL + '/locations'
    location.accountId = localStorage.getItem('accountId')
    location.defaultLoc = 0
    var payload = {
      payload: location
    }
    $http.post(url, payload).then(onCreateLocationSuccess, onCreateLocationFail)
  }

  me.getStores = function () {
    me.stores = []

    var url = constants.API_URL + '/locations?account=' + me.accountId
    return $http.get(url).then(function (res) {
      console.log('storesService getStores %O', res)
      me.stores = res.data
    })
  }

  me.updateLocation = function () {
    var url = constants.API_URL + '/locations/' + me.editLocation.locationId
    var payload = {
      payload: me.editLocation
    }
    $http.put(url, payload).then(onUpdateLocationSuccess, onUpdateLocationFail, me.getStores)
  }

  me.deleteLocation = function (location) {
    var url = constants.API_URL + '/locations/' + location.locationId
    if (location.name.includes('default_')) {
      toastr.error('Cannot delete the default location!', "I'm afraid I can't do that.")
      return
    } else {
      $http.delete(url).then(onDeleteSuccess, onDeleteFail)
    }
  }

  // API RESPONSE/ERROR HANDLING

  function onCreateLocationSuccess (res) {
    if (res.status === 200) {
      toastr.success('New Location Created', 'Success!')
    }
  }

  function onCreateLocationFail (err) {
    console.error(err)
    toastr.error('Could not create new location.')
  }

  function onUpdateLocationSuccess (res) {
    if (res.statusCode === 200) {
      toastr.success('Location Updated', 'Success!')
    }
  }

  function onUpdateLocationFail (err) {
    console.error(err)
    toastr.error('Could not update location.')
  }

  function onDeleteSuccess (res) {
    if (res.statusCode === 200) {
      toastr.success('Location deleted', 'Success!')
    }
  }

  function onDeleteFail (err) {
    console.error(err)
    toastr.error('Could not delete location.')
  }

  return me
})
