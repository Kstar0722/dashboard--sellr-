angular.module('core').filter('productTags', function () {
  return function (properties) {
    if (!properties) return []
    return properties.filter(function (prop) {
      return prop.propId === 181
    })
  }
})
