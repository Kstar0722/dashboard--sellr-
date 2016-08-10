'use strict'
/* global angular, moment, _ */
angular.module('users.admin')
  .controller('StoreOwnerOrdersController', [ '$scope', '$http', '$state', 'constants', 'toastr',
    function ($scope, $http, $state, constants, toastr) {
      var API_URL = constants.API_URL
      $scope.todayOrders = []
      $scope.pastOrders = []
      $scope.showPastOrders = false
      $scope.uiStatOrders = {
        orders: [],
        count: 0,
        salesTotal: 0
      }
      $scope.statsScopeLabel = 'Last 7 days'

      $scope.changeDisplayedOrders = function () {
        $scope.showPastOrders = !$scope.showPastOrders
        if ($scope.showPastOrders) {
          $scope.displayOrders = $scope.pastOrders
        } else {
          $scope.displayOrders = $scope.todayOrders
        }
      }

      function getOrders () {
        var ordersUrl = API_URL + '/mobile/reservations/store/' + 1269
        $http.get(ordersUrl).then(function (response) {
          var allOrders = response.data
          allOrders = _.sortBy(allOrders, 'pickupTime')
          $scope.allOrders = allOrders
          $scope.todayOrders = _.filter(allOrders, function (order) { return moment().isSame(order.pickupTime, 'day') })
          $scope.pastOrders = _.filter(allOrders, function (order) { return moment().isAfter(order.pickupTime, 'day') })
          $scope.displayOrders = $scope.todayOrders
          $scope.uiStatOrders.orders = getFilteredOrders(7)
          console.log($scope.todayOrders )
          refreshStats()
        })
      }

      function getFilteredOrders (days) {
        return _.filter($scope.allOrders, function (order) {
          var flag = true
          // Is Past
          flag = moment().isAfter(order.pickupTime, 'day')
          // AND is After days Filter
          flag = flag && moment().startOf('day').subtract(days, 'days').isBefore(order.pickupTime)
          return flag
        })
      }

      $scope.changeOrderStatsScope = function (days) {
        $scope.uiStatOrders.orders = getFilteredOrders(days)
        $scope.statsScopeLabel = 'Last ' + days + ' days'
        refreshStats()
      }

      function refreshStats () {
        $scope.uiStatOrders.count = $scope.uiStatOrders.orders.length
        $scope.uiStatOrders.shoppersCount = _.uniq(_.pluck(_.pluck($scope.uiStatOrders.orders, 'user'), '_id')).length
        $scope.uiStatOrders.salesTotal = _.reduce($scope.uiStatOrders.orders, function (memo, order) {
          return memo + parseFloat(order.total)
        }, 0)
      }

      $scope.markOrder = function (order) {
        switch (order.status) {
          case 'submitted':
          case 'In Progress':
            order.status = 'pickedup'
            break
          case 'pickedup':
            order.status = 'submitted'
            break
          default:
            return
        }
        updateOrder(order)
      }
      function updateOrder (order) {
        var url = constants.API_URL + '/mobile/reservations/' + order._id
        $http.put(url, order).then(function (result) {
          if (result.data.status === 'pickedup') {
            toastr.success('Order Marked as Picked Up')
          } else {
            toastr.warning('Order Marked as not picked up yet')
          }
        })
      }

      getOrders()
    }
  ])
