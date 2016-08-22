'use strict'
/* global angular, moment, _*/
angular.module('users.admin')
  .controller('StoreOwnerOrdersController', [ '$scope', '$http', '$state', 'constants', 'toastr', '$stateParams', 'SocketAPI', 'accountsService',
    function ($scope, $http, $state, constants, toastr, $stateParams, SocketAPI, accountsService) {
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
      $scope.init = function () {
        getOrders()
      }
      accountsService.bindSelectedAccount($scope)
      $scope.$watch('selectAccountId', function () {
        $scope.init()
      })
      SocketAPI = SocketAPI.bindTo($scope)

      SocketAPI.on('reservation.created', function (order) {
        loadOrders($scope.allOrders.concat(order))
      })

      SocketAPI.on('reservation.updated', function (order) {
        replaceItem($scope.allOrders, order)
        loadOrders($scope.allOrders)
      })

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
          loadOrders(response.data)
          $scope.displayOrders = $scope.todayOrders
        })
      }

      function loadOrders (orders) {
        var reloadToday = $scope.displayOrders === $scope.todayOrders
        var reloadPast = $scope.displayOrders === $scope.pastOrders

        $scope.allOrders = orders
        $scope.todayOrders = _.filter(orders, function (order) { return moment().isSame(order.pickupTime, 'day') && order.status !== 'Completed' && order.status !== 'Cancelled' })
        accountsService.ordersCount = $scope.todayOrders.length
        $scope.todayOrders = _.sortBy($scope.todayOrders, 'status').reverse()
        $scope.pastOrders = _.filter(orders, function (order) { return moment().isAfter(order.pickupTime, 'day') || isTodayButCompleted(order) })
        $scope.pastOrders = _.sortBy($scope.pastOrders, 'pickupTime').reverse()
        $scope.uiStatOrders.orders = getFilteredOrders(7)
        refreshStats()

        if (reloadToday) $scope.displayOrders = $scope.todayOrders
        if (reloadPast) $scope.displayOrders = $scope.pastOrders
      }

      function isTodayButCompleted (order) {
        return moment().isSame(order.pickupTime, 'day') && (order.status === 'Completed' || order.status === 'Cancelled')
      }

      function getFilteredOrders (days) {
        return _.filter($scope.allOrders, function (order) {
          var flag = true
          // Is Today but COMPLETED
          flag = moment().isSame(order.pickupTime, 'day') && order.status === 'Completed'
          // OR Is Past
          flag = flag || moment().isAfter(order.pickupTime, 'day')
          // AND is After days Filter
          flag = flag && moment().startOf('day').subtract(days, 'days').isBefore(order.pickupTime)
          // AND Was not cancelled
          flag = flag && order.status !== 'Cancelled'
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

      $scope.markOrder = function (order, newStatus) {
        order.status = newStatus
        updateOrder(order)
      }

      function updateOrder (order) {
        var url = constants.API_URL + '/mobile/reservations/' + order._id
        $http.put(url, order).then(function (result) {
          if (result.data.status === 'Submitted') {
            toastr.warning('Order marked as Submitted')
          }
          if (result.data.status === 'Ready for Pickup') {
            toastr.info('Order marked as Ready for Pick Up')
          }
          if (result.data.status === 'Completed') {
            toastr.success('Order Completed')
          }
          if (result.data.status === 'Cancelled') {
            toastr.warning('Order Cancelled')
          }
          loadOrders($scope.allOrders)
        })
      }

      function replaceItem (arr, item) {
        if (_.isEmpty(arr) || _.isEmpty(item)) return false
        var index = _.findIndex(arr, { _id: item._id })
        if (index < 0) return false
        arr.splice(index, 1, item)
        return true
      }
    }
  ])
