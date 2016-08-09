'use strict'
/* global angular, moment, _ */
angular.module('users.admin').controller('StoreOwnerOrdersController', [ '$scope', 'Authentication', '$filter', 'Admin', '$http', '$state', 'CurrentUserService', 'constants', 'accountsService', 'toastr',
  function ($scope, Authentication, $filter, Admin, $http, $state, CurrentUserService, constants, accountsService, toastr) {
    var API_URL = constants.API_URL
    $scope.todayOrders = []
    $scope.pastOrders = []

    function getOrders () {
      var ordersUrl = API_URL + '/mobile/reservations/store/' + 1269
      $http.get(ordersUrl).then(function (response) {
        console.log('Response Orders From Store', response.data)
        var allOrders = response.data
        $scope.todayOrders = _.filter(allOrders, function (order) { return moment().isSame(order.pickupTime, 'day') })
        $scope.pastOrders = _.filter(allOrders, function (order) { return moment().isAfter(order.pickupTime, 'day') })
        _.each($scope.todayOrders, function (order) {
          order.uiHour = 2
          order.uiTime = 'PM'
          order.uiCreated = 'July 29, 2016 8:00PM'
        })
        console.log('today orders', $scope.todayOrders)
      })
    }
    getOrders()
  }

])
