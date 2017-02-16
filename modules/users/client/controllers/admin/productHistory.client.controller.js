'use strict'
angular.module('users.admin').controller('ProductHistoryController', ['$scope', '$filter',
  function ($scope, $filter) {
    var data = [
      {
        productId: '111',
        userId: '777',
        userName: 'Fortes Diego',
        userEmail: 'frtes@frotes.com',
        date: moment().toDate()
      },
      {
        productId: '222',
        userId: '888',
        userName: 'Shwaou Arnold',
        userEmail: 'Shwaou@asd.com',
        date: moment().subtract(1, 'days').toDate()
      },
      {
        productId: '333',
        userId: '999',
        userName: 'Susaz Learny',
        userEmail: 'Susaz@weqe.com',
        date: moment().subtract(3, 'days').toDate()
      },
      {
        productId: '444',
        userId: 'x214534',
        userName: 'Richmond Ray',
        userEmail: 'Richmond@trtr.com',
        date: moment().subtract(15, 'days').toDate()
      },
      {
        productId: '555',
        userId: '777',
        userName: 'Fortes Diego',
        userEmail: 'frtes@frotes.com',
        date: moment().subtract(13, 'days').toDate()
      },
      {
        productId: '123',
        userId: '555',
        userName: 'Fortes Diego',
        userEmail: 'frtes@frotes.com',
        date: moment().subtract(53, 'days').toDate()
      }
    ]
    _.each(data, function (row) {
      var dateUI = moment(row.date)
      if (dateUI.isValid()) {
        row.dateUI = dateUI.format('MMM, DD YYYY')
      } else {
        row.dateUI = '-'
      }
    })
    $scope.ui = {}
    $scope.ui.data = data
    $scope.customRangeHandler = function () {
      if ($scope.ui.startDateInput && $scope.ui.endDateInput) {
        $scope.todayBtn = $scope.yesterdayBtn = $scope.weekBtn = $scope.monthBtn = false
        $scope.ui.filterStartDate = moment($scope.ui.startDateInput).startOf('day')
        $scope.ui.filterEndDate = moment($scope.ui.endDateInput).endOf('day')
        filterDataByDate()
      }
    }
    $scope.filterDate = function (filter) {
      $scope.ui.startDateInput = $scope.ui.endDateInput = undefined
      switch (filter) {
        case 'today':
          $scope.todayBtn = !$scope.todayBtn
          $scope.yesterdayBtn = $scope.weekBtn = $scope.monthBtn = false
          break
        case 'yesterday':
          $scope.yesterdayBtn = !$scope.yesterdayBtn
          $scope.todayBtn = $scope.weekBtn = $scope.monthBtn = false
          break
        case 'week':
          $scope.weekBtn = !$scope.weekBtn
          $scope.todayBtn = $scope.yesterdayBtn = $scope.monthBtn = false
          break
        case 'month':
          $scope.monthBtn = !$scope.monthBtn
          $scope.todayBtn = $scope.yesterdayBtn = $scope.weekBtn = false
          break
        default:
          break
      }
      $scope.ui.filterStartDate = undefined
      $scope.ui.filterEndDate = moment().endOf('day')
      if ($scope.todayBtn) {
        $scope.ui.filterStartDate = moment().startOf('day')
      }
      if ($scope.yesterdayBtn) {
        $scope.ui.filterStartDate = moment().subtract(1, 'days').startOf('day')
        $scope.ui.filterEndDate = moment().subtract(1, 'days').endOf('day')
      }
      if ($scope.weekBtn) {
        $scope.ui.filterStartDate = moment().subtract(7, 'days').startOf('day')
      }
      if ($scope.monthBtn) {
        $scope.ui.filterStartDate = moment().subtract(30, 'days').startOf('day')
      }
      filterDataByDate()
    }
    function filterDataByDate () {
      $scope.ui.data = $filter('filter')(data, function (row) {
        var rowMoment = moment(row.date)
        if (!rowMoment.isValid()) return false
        if (!$scope.ui.filterStartDate) return true
        if (rowMoment.isBetween($scope.ui.filterStartDate, $scope.ui.filterEndDate)) {
          return true
        } else {
          return false
        }
      })
    }
  }
])
