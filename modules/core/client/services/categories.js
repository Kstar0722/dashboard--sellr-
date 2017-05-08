angular.module('core').service('categories', function () {
  var me = this
  me.categories = {
    1: ['Red', 'White', 'Rose', 'Sparkling', 'Dessert', 'Fruit Wine'],
    2: ['Domestic', 'Imported', 'Craft'],
    3: ['Brandy', 'Gin', 'Liqueur/Cordial', 'Rum', 'Tequila', 'Vodka', 'Whiskey', 'Sake'],
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

  me.getProductTags = function (product) {
    product.tags = []
    product.properties.forEach(function (prop) {
      if (prop.propId === 181) {
        product.tags.push({
          value: prop.value,
          valueId: prop.valueId
        })
      }
    })
    return product
  }

  me.addTag = function (product, newTag) {
    product.tags.push({
      value: newTag || ''
    })
    return product
  }

  me.removeTag = function (product, i) {
    var k = product.properties.findIndex(function (prop) {
      return prop.valueId === product.tags[i].valueId
    })
    product.tags.splice(i, 1)
    product.properties[k].changed = 'remove'
    return product
  }

  me.setProductTags = function (product) {
    product.tags.forEach(function (tag) {
      if (!tag.valueId) {
        // new tag
        product.properties.push({
          propId: 181,
          value: tag.value,
          changed: 'new',
          productId: product.productId
        })
      } else {
        var i = product.properties.findIndex(function (prop) {
          return prop.valueId === tag.valueId
        })
        if (i > -1) {
          // tag exists
          if (tag.value.length === 0) {
            // tag has been removed
            product.properties[i].changed = 'remove'
            product.tags.splice(i, 1)
          } else if (tag.value !== product.properties[i].value) {
            // tag has been updated
            product.properties[i].value = tag.value
            product.properties[i].changed = 'updated'
          }
        }
      }
    })

    return product
  }

  return me
})
