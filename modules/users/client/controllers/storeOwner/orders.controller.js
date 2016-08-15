'use strict'
/* global angular, moment, _, localStorage*/
angular.module('users.admin')
  .controller('StoreOwnerOrdersController', [ '$scope', '$http', '$state', 'constants', 'toastr', '$stateParams', 'SocketAPI','accountsService',
    function ($scope, $http, $state, constants, toastr, $stateParams, SocketAPI,accountsService) {
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
      SocketAPI = SocketAPI.bindTo($scope);

      SocketAPI.on('reservation.created', function (order) {
        loadOrders($scope.allOrders.concat(order));
      });

      SocketAPI.on('reservation.updated', function (order) {
        replaceItem($scope.allOrders, order);
        loadOrders($scope.allOrders);
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
          loadOrders(response.data);
          $scope.displayOrders = $scope.todayOrders
          console.log($scope.todayOrders)
        })
      }

      function loadOrders(orders) {
        var reloadToday = $scope.displayOrders == $scope.todayOrders;
        var reloadPast = $scope.displayOrders == $scope.pastOrders;

        orders = _.sortBy(orders, 'pickupTime');
        $scope.allOrders = orders;
        $scope.todayOrders = _.filter(orders, function (order) { return moment().isSame(order.pickupTime, 'day') });
        $scope.pastOrders = _.filter(orders, function (order) { return moment().isAfter(order.pickupTime, 'day') });
        $scope.uiStatOrders.orders = getFilteredOrders(7);
        refreshStats();

        if (reloadToday) $scope.displayOrders = $scope.todayOrders;
        if (reloadPast) $scope.displayOrders = $scope.pastOrders;
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

      function replaceItem(arr, item) {
        if (_.isEmpty(arr) || _.isEmpty(item)) return false;
        var index = _.findIndex(arr, { _id: item._id });
        if (index < 0) return false;
        arr.splice(index, 1, item);
        return true;
      }

      getOrders()
    }
  ])
