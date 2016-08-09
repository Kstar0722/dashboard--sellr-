'use strict'
/* global angular */
angular.module('users.admin').controller('StoreOwnerOrdersController', [ '$scope', 'Authentication', '$filter', 'Admin', '$http', '$state', 'CurrentUserService', 'constants', 'accountsService', 'toastr',
  function ($scope, Authentication, $filter, Admin, $http, $state, CurrentUserService, constants, accountsService, toastr) {
    var API_URL = constants.API_URL
    function getOrders () {
      var ordersUrl = API_URL + '/mobile/reservations/store/' + 1269
      $http.get(ordersUrl).then(function (response) {
        console.log('response ORDERSSSSS', response)
      })
    }
    getOrders()
  }

])
