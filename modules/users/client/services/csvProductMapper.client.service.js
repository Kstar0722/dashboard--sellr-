/* globals angular, _ */
angular.module('users').service('csvProductMapper', function (ProductTypes) {
  var self = this

  this.EMPTY_FIELD_NAME = '-'
  this.STORE_FIELDS = []
  this.SKIP_NO_TYPES = true;

  this.init = function (overrideFields, skipNoTypes) {
    this.STORE_FIELDS = overrideFields || ['name', 'type', 'upc', 'description'];
    this.SKIP_NO_TYPES = typeof skipNoTypes != 'undefined' ? skipNoTypes : true;
  };

  this.mapProducts = function (items, columns) {
    var mapping = columns ? extractMappings(columns) : autoResolveMappings(items[0])
    if (_.isEmpty(mapping)) return []
    var result = _.map(items, function (obj) {
      var item = mapProductDto(obj, mapping)
      if (self.SKIP_NO_TYPES && _.isNull(item.type)) return null;
      return item;
    })
    // removes nulls with wrong types
    result = _.compact(result)
    return result
  }

  //
  // PRIVATE FUNCTIONS
  //

  function extractMappings (columns) {
    var mappings = {}
    _.each(columns, function (col) {
      if (col.mapping === self.EMPTY_FIELD_NAME) return
      mappings[col.name] = col.mapping
    })
    return mappings
  }

  function autoResolveMappings (obj) {
    if (!obj) return null
    var keys = _.keys(obj)
    var mapping = {}
    _.each(self.STORE_FIELDS, function (field) {
      var mappedKey = _.find(keys, function (k) { return k.toUpperCase() === field.toUpperCase() })
      if (mappedKey) mapping[field] = mappedKey
    })
    return mapping
  }

  function mapProductDto (obj, mapping) {
    var result = {}
    _.each(mapping, function (field, from) {
      result[field] = obj[mapping[from]]
    })
    if (result.type) {
      result.type = mapProductTypeId(result.type)
    }
    return result
  }

  function mapProductTypeId (value) {
    value = (value + '').toLowerCase()
    var productType = _.find(ProductTypes, function (type) {
      var isMatch = value === type.name.toLowerCase()
      isMatch = isMatch || value === type.productTypeId.toString()
      isMatch = isMatch || _.contains(type.similarNames.split(','), value)
      return isMatch
    })
    // returns null if not found
    if (self.SKIP_NO_TYPES && _.isUndefined(productType)) return null;
    return productType.productTypeId;
  }
})
