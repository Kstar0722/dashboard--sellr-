/* globals angular, localStorage */
angular.module('core').service('storesService', function ($http, constants, $q, toastr) {
  var me = this

  me.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  me.getStoreById = function (storeId) {
    return $http.get(constants.BWS_API + '/storedb/stores/' + storeId + '?supc=true').then(handleResponse).then(function (data) {
      return data instanceof Array ? data[ 0 ] : data
    })
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

  // BELOW IS COPIED FROM OLD LOCATIONS SERVICE BUT REWORKED to new Store db URLS/**/
  me.stores = []

  me.getStores = function (accountId) {
    var defer = $q.defer()
    me.stores = []
    me.currentAccountId = accountId
    var url = constants.BWS_API + '/storedb/stores?info=true&acc=' + accountId
    $http.get(url).then(function (res) {
      console.log('storesService getStores %O', res.data)
      me.stores = res.data
      defer.resolve()
    })
    return defer.promise
  }

  me.createStore = function (store) {
    store.accountId = me.currentAccountId
    return $http.post(constants.BWS_API + '/storedb/stores', { payload: store }).then(onAPISuccess.bind(this, 'create'), onAPIError.bind(this, 'create'))
  }

  me.updateStore = function (store) {
    return $http.put(constants.BWS_API + '/storedb/stores/details', { payload: store }).then(onAPISuccess.bind(this, 'update'), onAPIError.bind(this, 'update'))
  }

  me.deleteStore = function (storeId) {
    var url = constants.BWS_API + '/storedb/stores/' + storeId
    return $http.delete(url).then(onAPISuccess.bind(this, 'delete'), onAPIError.bind(this, 'delete'))
  }

  me.initWorkSchedule = function (store) {
    if (!store) return

    store.details = store.details || {}
    var workSchedule = store.details.workSchedule = store.details.workSchedule || []

    if (workSchedule.length !== me.weekdays.length) {
      store.details.workSchedule = _.map(me.weekdays, function (day, i) {
        return _.find(workSchedule, { day: i }) || { day: i, name: day }
      })
    }

    for (var i in workSchedule) {
      var day = workSchedule[i]
      day.name = me.weekdays[i]

      day.openTime = parseTime(day.openTime)
      day.closeTime = parseTime(day.closeTime)

      if (typeof day.open !== 'boolean') {
        if (day.openTime && day.closeTime) {
          day.open = true
        }
      }

      day.openTimeStr = formatTime(day.openTime)
      day.closeTimeStr = formatTime(day.closeTime)
      day.fullTime = day.openTimeStr === day.closeTimeStr && day.openTimeStr === '12AM'
    }
  }

  // API RESPONSE/ERROR HANDLING
  function onAPISuccess (operation) {
    return me.getStores(me.currentAccountId).then(function () {
      switch (operation) {
        case 'create':
          toastr.success('New Store created successfully')
          break
        case 'update':
          toastr.success('Store updated successfully')
          break
        case 'delete':
          toastr.success('Store deleted successfully')
          break
        default:
          break
      }
    })
  }

  function onAPIError (operation) {
    switch (operation) {
      case 'create':
        toastr.error('The store could not be created')
        break
      case 'update':
        toastr.error('The store could not be udpated')
        break
      case 'delete':
        toastr.error('The store could not be deleted')
        break
      default:
        break
    }
  }

  function parseTime (str) {
    return str && moment(str).toDate()
  }

  function formatTime (date) {
    return date && moment(date).format('h:mm A').replace(':00 ', '')
  }

  return me
})
