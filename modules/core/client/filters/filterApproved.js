angular.module('core').filter('filterApproved', function () {
  return function (products) {
    return products.filter(function (prod) {
      return prod.status === 'approved' || prod.status === 'done'
    })
  }
})
