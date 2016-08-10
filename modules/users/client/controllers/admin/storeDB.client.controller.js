/* globals angular, _ */
angular.module('users.admin').controller('StoreDbController', function ($scope, locationsService, orderDataService, $state, accountsService, CurrentUserService, Authentication, $http, constants, uploadService, toastr) {
  if (Authentication.user) {
    $scope.account = { createdBy: Authentication.user.username }
  }

  $scope.orders = {}
  $scope.orderItems = []
  var url = constants.BWS_API + '/storedb/stores'
  $http.get(url).then(getStoresSuccess, getStoresError)

  function getStoresSuccess (response) {
    if (response.status === 200) {
      // timeEnd('getProductList')
      $scope.orders = response.data
      console.log($scope.orders)
      _.each($scope.orders, function (elm, ind, orders) {
        if (elm.status.received > 0) {
          elm.status.barClass = 'red'
        } else {
          if (elm.status.processed > 0 || elm.status.done > 0) {
            elm.status.barClass = 'orange'
          } else {
            elm.status.barClass = 'green'
          }
        }
      })
    }
  }

  function getStoresError (error) {
    console.error('getAvailOrderError %O', error)
  }

  $scope.goToMatch = function (id) {
    orderDataService.currentOrderId = id
    orderDataService.getData(id).then(function (response) {
      $state.go('editor.match', { id: id })
    })
  }
})
