/* globals _ */
angular.module('users').service('csvStoreMapper', function (ProductTypes) {
  var STORE_FIELDS = ['description', 'type', 'upc', 'name'];

  this.map = function (csvStore) {
    var mapping = mapStoreMapping(csvStore[0]);
    if (!mapping) return; // store db empty
    var result = _.map(csvStore, function(store) { return mapStoreDto(store, mapping); });
    return result;
  };

  //
  // PRIVATE FUNCTIONS
  //

  function mapStoreMapping(obj) {
    if (!obj) return null;
    var keys = _.keys(obj);
    var mapping = {};
    _.each(STORE_FIELDS, function(field) {
      var mappedKey = _.find(keys, function(k) { return k.toUpperCase() == field.toUpperCase(); });
      if (mappedKey) mapping[field] = mappedKey;
    });
    return mapping;
  }

  function mapStoreDto(obj, mapping) {
    var result = {};
    _.each(mapping, function (field, from) {
      result[field] = obj[mapping[from]];
    });
    if (result.type) result.type = mapProductTypeId(result.type);
    return result;
  }

  function mapProductTypeId(value) {
    value = (value + '').toUpperCase();
    var productType = _.find(ProductTypes, function(type) {
      return value == type.name[0].toUpperCase()
          || value == type.name.toUpperCase()
          || value == type.productTypeId;
    });
    return productType && productType.productTypeId;
  }
});
