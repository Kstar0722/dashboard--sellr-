angular.module('core').service('ProductTypesService', function ($http, constants, $q, utilsService) {
  var me = this

  me.getProductTypes = function () {
    var defer = $q.defer()
    $http.get(constants.API_URL + '/products/types').then(function (res) {
      defer.resolve(formatTypes(res.data))
    })
    return defer.promise
  }

  me.updateProductType = function (typeId, typeName) {
    var payload = {
      payload: {
        productTypeId: typeId,
        type: formatTypeNameForSaving(typeName)
      }
    }
    var defer = $q.defer()
    $http.put(constants.API_URL + '/products/types', payload).then(function (res) {
      defer.resolve()
    })
    return defer.promise
  }

  me.getProductTypeProperties = function (typeId) {
    var defer = $q.defer()
    $http.get(constants.API_URL + '/products/propertylist?type=' + typeId).then(function (res) {
      defer.resolve(formatTypeProperties(res.data))
    })
    return defer.promise
  }

  me.getDefaultPropertyOptions = function () {
    return {
      type: 'Text Input',
      instructions: '',
      ownercanedit: false,
      editorcanedit: false,
      selectOptions: ''
    }
  }

  function formatTypes (types) {
    return _.map(types, function (t) {
      var friendlyName = t.type.replace(/_/g, ' ')
      friendlyName = utilsService.stringToFirstLetterUppercase(friendlyName)
      return _.extend(t, {friendlyName: friendlyName})
    })
  }

  function formatTypeNameForSaving (type) {
    var nameForDB = type.replace(/\s/g, '_')
    nameForDB = nameForDB.toUpperCase()
    return nameForDB
  }

  function formatTypeProperties (properties) {
    return _.map(properties, function (p) {
      if (_.isEmpty(p.options)) {
        p.options = me.getDefaultPropertyOptions()
      }
      return p
    })
  }

  return me
})
