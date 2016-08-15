'use strict'
/* global angular, moment, _, localStorage*/
angular.module('users.admin')
  .controller('StoreOwnerOrdersController', [ '$scope', '$http', '$state', 'constants', 'toastr', '$stateParams', 'accountsService',
    function ($scope, $http, $state, constants, toastr, $stateParams, accountsService) {
      var API_URL = constants.API_URL
      $scope.todayOrders = []
      $scope.pastOrders = []
      $scope.showPastOrders = false
      $scope.uiStatOrders = {
        orders: [],
        count: 0,
        salesTotal: 0
      }

      accountsService.bindSelectedAccount($scope);
      $scope.$watch('selectAccountId', function () {
        $scope.init();
      });

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
        var ordersUrl = API_URL + '/mobile/reservations/store/' + $scope.selectAccountId
        $http.get(ordersUrl).then(function (response) {
          var allOrders = response.data
          allOrders = _.sortBy(allOrders, 'pickupTime')
          $scope.allOrders = allOrders
          $scope.todayOrders = _.filter(allOrders, function (order) { return moment().isSame(order.pickupTime, 'day') })
          $scope.pastOrders = _.filter(allOrders, function (order) { return moment().isAfter(order.pickupTime, 'day') })
          $scope.displayOrders = $scope.todayOrders
          $scope.uiStatOrders.orders = getFilteredOrders(7)
          console.log($scope.todayOrders)
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
          case 'Submitted':
            order.status = 'Ready for Pickup'
            break
          case 'Ready for Pickup':
            order.status = 'Complete'
            break
          case 'Complete':
            order.status = 'Submitted'
            break
          default:
            order.status = 'Submitted'
        }
        updateOrder(order)
      }
      function updateOrder (order) {
        var url = constants.API_URL + '/mobile/reservations/' + order._id
        $http.put(url, order).then(function (result) {
          if (result.data.status === 'Submitted') {
            toastr.warning('Order Unmarked')
          }
          if (result.data.status === 'Ready for Pickup') {
            toastr.info('Order Marked as Ready for Pick Up')
          }
          if (result.data.status === 'Complete') {
            toastr.success('Order Completed')
          }
        })
      }

      $scope.init = function () {
        getOrders();
      };
    }
  ])
