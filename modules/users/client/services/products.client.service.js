/* globals angular, localStorage */
angular.module('users').service('productsService', function ($http, constants, $q) {
  var me = this

  me.createCategory = function (newCategory) {
    if (!newCategory.storeId) {
      newCategory.noStore = true;
    }

    var payload = {
      payload: newCategory
    };
    return $http.post(constants.BWS_API + '/choose/plans', payload).then(function (response) {
      return response.data;
    });
  };

  me.getTemplates = function (tag, options) {
    var defer = $q.defer();

    console.log('getting templates tagged with ' + tag);
    $http.get(constants.BWS_API + '/choose/templates?tag=' + tag, options).then(function (res) {
      defer.resolve(res.data);
    });

    return defer.promise;
  };

  return me
})
