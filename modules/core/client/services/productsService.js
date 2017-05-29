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

  me.addPlanProduct = function (plan, product) {
    if (!product.productId || !plan.planId) { return }
    product.planId = plan.planId
    var url = constants.BWS_API + '/choose/products'
    return $http.post(url, { payload: product })
  }

  me.addNotFound = function (product) {
    var url = constants.BWS_API + '/choose/products'
    return $http.post(url, { payload: product })
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

  me.removePlanProduct = function (plan, product) {
    if (!product.productId || !plan.planId) { return }
    var params = {
      plan: plan.planId,
      product: product.productId
    }
    var url = constants.BWS_API + '/choose/products?' + $httpParamSerializer(params)
    return $http.delete(url)
  }

  me.getPlanProducts = function (storeId) {
    var defer = $q.defer()
    var url = constants.BWS_API + '/choose/plans?store=' + storeId
    $http.get(url).then(function (response) {
      var plans = _.map(response.data, function (plan) { return initPlan(plan) })
      me.currentStoreId = storeId
      me.currentPlans = plans
      defer.resolve(plans)
    })
    return defer.promise
  }

  me.deletePriceOption = function (priceId) {
    var defer = $q.defer()
    var url = constants.BWS_API + '/choose/products/price?id=' + priceId
    $http.delete(url).then(function (res) {
      defer.resolve()
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
      initProduct(product, plan)
    })
    return plan
  }

  function initProduct (product, plan) {
    if (!product) return product
    product.planId = plan.planId
    product.planLabel = plan.label
    product.options = product.options || {}
    product.price = parseFloat(product.price) || product.price
    product.oprice = parseFloat(product.oprice) || product.oprice
    product.researchImage = product.options.researchImage
    product.skus = product.skus || []
    product.prices = product.prices || []

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
