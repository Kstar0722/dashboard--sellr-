angular.module('core').service('categories', function (constants, $http) {
  var me = this
  me.categories = {
    1: ['Red', 'White', 'Rose', 'Sparkling', 'Dessert', 'Fruit Wine'],
    2: ['Domestic', 'Imported', 'Craft', 'Malt Beverage'],
    3: ['Brandy', 'Gin', 'Liqueur/Cordial', 'Rum', 'Tequila', 'Vodka', 'Whiskey', 'Sake', 'Ready to Drink'],
    17: ['Supplements', 'Multivitamins', 'Fish Oil']
  }

  me.getProductCategory = function (product) {
    var i = product.properties.findIndex(function (prop) {
      return prop.propId === 204 // propertyId for category in DB
    })
    if (i > -1) {
      // category property exists
      product.category = product.properties[i].value
    }
    return product
  }

  me.setProductCategory = function (product) {
    if (product.category) {
      var i = product.properties.findIndex(function (prop) {
        return prop.propId === 204 // propertyId for category in DB
      })
      if (i > -1) {
        if (product.properties[i].value !== product.category) {
          product.properties[i].value = product.category
          product.properties[i].changed = 'update'
        }
      } else {
        product.properties.push({
          productId: product.productId,
          propId: 204,
          label: 'Category',
          value: product.category,
          changed: 'new'
        })
      }
    }
    return product
  }

  me.addTag = function (product, newTag) {
    var url = constants.API_URL + '/products/property/value'
    var newProp = {
      productId: product.productId,
      propId: 181,
      value: newTag
    }
    return $http.post(url, {payload: newProp}).then(res => {
      newProp.valueId = res.data.insertId
      newProp.changed = false
      product.properties.push(newProp)
      return product
    }).catch(console.error)
  }

  me.removeTag = function (product, tag) {
    var i = product.properties.findIndex(prop => prop.valueId === tag.valueId)
    product.properties.splice(i, 1)
    var url = constants.API_URL + '/products/properties?valueId=' + tag.valueId
    return $http.delete(url).catch(console.error)
  }

  return me
})
