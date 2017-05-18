/* globals angular, localStorage */
angular.module('core').service('productsService', function ($http, constants, $q, $httpParamSerializer) {
  var me = this

  me.createCategory = function (newCategory) {
    if (!newCategory.storeId) {
      newCategory.noStore = true
    }

    var payload = {
      payload: newCategory
    }
    return $http.post(constants.BWS_API + '/choose/plans', payload).then(function (response) {
      return response.data
    })
  }

  me.getTemplates = function (tag, options) {
    var defer = $q.defer()
    $http.get(constants.BWS_API + '/choose/templates?tag=' + tag, options).then(function (res) {
      defer.resolve(res.data)
    })

    return defer.promise
  }

  me.updatePlanProduct = function (product) {
    if (!product.planId || !product.productId) { return false }
    var params = {
      planId: product.planId,
      product: product.productId
    }
    var payload = {
      payload: product
    }
    var url = constants.BWS_API + '/choose/products?' + $httpParamSerializer(params)
    return $http.put(url, payload)
  }

  me.getPlanProducts = function (accountId) {
    var defer = $q.defer()
    var url = constants.BWS_API + '/choose/plans?account=' + accountId
    $http.get(url).then(function (response) {
      var plans = _.map(response.data, function (plan) { return initPlan(plan) })
      defer.resolve(plans)
    })
    return defer.promise
  }

  me.buildSlots = function () {
    var slots = []
    var letters = [ 'A', 'B', 'C', 'D', 'E', 'F' ]
    for (var l in letters) {
      for (var i = 1; i <= 6; i++) {
        slots.push({slot: letters[ l ] + i})
      }
    }
    return slots
  }

  function initPlan (plan) {
    if (!plan) return plan
    plan.products = plan.products || []
    _.each(plan.products, function (product) {
      initProduct(product, plan.planId)
    })
    return plan
  }

  function initProduct (product, planId) {
    if (!product) return product
    product.planId = planId
    product.options = product.options || {}
    product.price = parseFloat(product.price) || product.price
    product.oprice = parseFloat(product.oprice) || product.oprice
    product.researchImage = product.options.researchImage

    if (!product.publicUrl) {
      var media = _.find(product.mediaAssets, { type: 'IMAGE' })
      product.publicUrl = media && media.publicUrl
    }

    if (!_.isEmpty(product.prices)) {
      var defaultIndex = _.findIndex(product.prices, function (p) {
        return p.size === product.defaultPriceLabel
      })
      if (defaultIndex > -1) {
        product.prices.unshift(product.prices.splice(defaultIndex, 1)[0])
      }
    }

    return product
  }

  return me
})
