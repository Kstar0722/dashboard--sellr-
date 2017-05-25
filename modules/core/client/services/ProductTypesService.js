angular.module('core').service('ProductTypesService', function ($http, constants, $q, utilsService) {
  var me = this

  // GET
  // GET
  // GET
  me.getProductTypes = function () {
    var defer = $q.defer()
    $http.get(constants.API_URL + '/products/types').then(function (res) {
      defer.resolve(formatTypes(res.data))
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

  // CREATE
  // CREATE
  // CREATE
  me.createProductTypeProperty = function (typeId, prop) {
    var payload = {
      payload: {
        productTypeId: typeId,
        label: prop.label,
        options: prop.options
      }
    }
    var defer = $q.defer()
    $http.post(constants.API_URL + '/products/property', payload).then(function (res) {
      defer.resolve()
    })
    return defer.promise
  }

  // UPDATE
  // UPDATE
  // UPDATE
  me.updateProductType = function (typeId, typeName) {
    var payload = {
      payload: {
        productTypeId: typeId,
        type: formatTypeNameForSaving(typeName)
      }
    }
    if (typeId) {
      return $http.put(constants.API_URL + '/products/types', payload)
    } else {
      return $http.post(constants.API_URL + '/products/types', payload)
    }
  }

  me.updateProductTypeProperty = function (prop) {
    var payload = {
      payload: {
        propId: prop.propId,
        label: prop.label,
        options: prop.options
      }
    }
    var defer = $q.defer()
    $http.put(constants.API_URL + '/products/property', payload).then(function (res) {
      defer.resolve()
    })
    return defer.promise
  }

  // DELETE
  // DELETE
  // DELETE
  me.deleteProductTypeProperty = function (prop) {
    var defer = $q.defer()
    $http.delete(constants.API_URL + '/products/properties?prop=' + prop.propId).then(function (res) {
      defer.resolve()
    })
    return defer.promise
  }

  // INTERNAL FUNCTIONS
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
    var props = _.map(properties, function (p) {
      if (_.isEmpty(p.options)) {
        p.options = me.getDefaultPropertyOptions()
      }
      if (p.visibility) {
        return p
      } else {
        return null
      }
    })
    return _.compact(props)
  }

  return me
})
