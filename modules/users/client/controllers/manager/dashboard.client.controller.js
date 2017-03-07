'use strict'

angular.module('users.manager').controller('DashboardController', ['$scope', '$stateParams', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'chartService', 'accountsService', 'toastr',
  function ($scope, $stateParams, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, chartService, accountsService, toastr) {
    $scope.authentication = Authentication

    accountsService.bindSelectedAccount($scope)
    $scope.$watch('selectAccountId', function (selectAccountId, prevValue) {
      if (selectAccountId === prevValue) return
      $scope.init()
    })

    $scope.myPermissions = localStorage.getItem('roles')

    $scope.chartService = chartService
    $scope.accountsService = accountsService
    $scope.onClick = function (points, evt) {
      console.log(points, evt)
    }
    $scope.chartOptions = {}
    $scope.init = function () {
      $scope.emails = []
      $scope.phones = []
      $scope.loyalty = []
      $scope.analytics = []
      $scope.locations = []
      $scope.stores = []
      $scope.specificLoc = []
      chartService.groupAndFormatDate($scope.selectAccountId)
      console.log('state params %O', $stateParams)
      $scope.sources = []
      $http.get(constants.API_URL + '/loyalty?account=' + $scope.selectAccountId).then(function (res, err) {
        if (err) {
          console.log(err)
          toastr.error('We\'re experiencing some technical difficulties with our database, please check back soon')
        }
        if (res) {
          for (var i in res.data) {
            var contact = JSON.parse(res.data[i].contactInfo)
            if (contact['email']) {
              $scope.emails.push({
                email: contact['email']
              })
            } else {
              $scope.phones.push({
                phone: contact['phone']
              })
            }
          }
        }
      })

      var url = constants.API_URL + '/analytics/top-products?account=' + $scope.selectAccountId
      $http.get(url).then(function (res, err) {
        if (err) {
          console.log(err)
          toastr.error('We\'re experiencing some technical difficulties with our database, please check back soon')
        }
        if (res) {
          console.log('analytics topProducts %O', res)
          for (var i in res.data) {
            if (res.data[i].action === 'Product-Request') {
              $scope.analytics.push(res.data[i])
            }
          }
        }
      })
    }
  }

])
