angular.module('core').service('ProductTypesService', function ($http, constants, $q, utilsService) {
  var me = this

  me.getProductTypes = function () {
    var defer = $q.defer()
    $http.get(constants.API_URL + '/products/types').then(function (res) {
      defer.resolve(formatTypes(res.data))
    })
    return defer.promise
  }

  function formatTypes (types) {
    return _.map(types, function (t) {
      var friendlyName = t.type.replace(/_/g, ' ')
      friendlyName = utilsService.stringToFirstLetterUppercase(friendlyName)
      return _.extend(t, {friendlyName: friendlyName})
    })
  }

  return me
})
