'use strict'
angular.module('users.admin').controller('ProductHistoryController', ['$scope', '$filter', '$http', 'constants',
  function ($scope, $filter, $http, constants) {
    // INITIALIZATION
    $scope.ui = {}
    var userProductsURL = constants.BWS_API + '/edit/products/users/'
    $http.get(userProductsURL).then(function (response) {
      $scope.ui.allData = _.map(response.data, function (row) {
        // Date treatment
        var dateUI = moment(row.lastedit || null)
        if (dateUI.isValid()) {
          row.dateUI = dateUI.format('MMM, DD YYYY')
        } else {
          row.dateUI = '-'
        }
        // userName treatment
        if (row.firstname && row.lastname) {
          row.userName = row.firstname + ' ' + row.lastname
        } else {
          row.userName = row.displayName || row.email || ''
        }
        return row
      })
      $scope.ui.dataShown = $scope.ui.allData
    })

    // SCOPE FUNCTIONS
    $scope.reOrderList = function (field) {
      var oldSort = $scope.ui.sortExpression || ''
      var asc = true
      if (oldSort.substr(1) === field) asc = oldSort[0] === '-'
      $scope.ui.sortExpression = (asc ? '+' : '-') + field
    }

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

    // PRIVATE FUNCTIONS
    function filterDataByDate () {
      $scope.ui.dataShown = $filter('filter')($scope.ui.allData, function (row) {
        if (!$scope.ui.filterStartDate) return true
        var rowMoment = moment(row.lastedit || null)
        if (!rowMoment.isValid()) return false
        if (!$scope.ui.filterStartDate || _.isUndefined(row.lastedit)) return true
        if (rowMoment.isBetween($scope.ui.filterStartDate, $scope.ui.filterEndDate)) {
          return true
        } else {
          return false
        }
      })
    }
  }
])
