/* globals angular, _ */
angular.module('users').service('storesService', function ($http, constants, $q, toastr) {
  var me = this

  me.getStoreById = function (storeId) {
    return $http.get(constants.BWS_API + '/storedb/stores/' + storeId + '?supc=true').then(handleResponse).then(function (data) {
      return data instanceof Array ? data[ 0 ] : data
    })
  };

  me.createStore = function (store) {
    return $http.post(constants.BWS_API + '/storedb/stores', { payload: store }).then(handleResponse);
  };

  me.importStoreProducts = function (storeId, storeItems) {
    if (!storeId) return $q.reject('no store db found in csv file');

    var payload = {
      id: storeId,
      items: storeItems
    };

    return $http.post(constants.BWS_API + '/storedb/stores/products/import', { payload: payload }).then(handleResponse);
  };

  function handleResponse (response) {
    if (response.status !== 200) throw Error(response.statusText)
    var data = response.data
    if (data.error) {
      console.error(data.error)
      throw Error(data.message || data.error)
    }
    return data
  }

  return me
})
