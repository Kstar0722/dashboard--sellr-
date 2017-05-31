angular.module('core').filter('filterPending', function () {
  return function (products) {
    return products.filter(function (prod) {
      return prod.status === 'received' || prod.status === 'new' || prod.status === 'inprogress'
    })
  }
})
