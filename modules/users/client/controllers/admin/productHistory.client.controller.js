'use strict'
angular.module('users.admin').controller('ProductHistoryController', ['$scope', '$state', 'Authentication', '$timeout', 'CurrentUserService', 'constants', '$http', 'toastr', '$q',
  function ($scope, $state, Authentication, $timeout, CurrentUserService, constants, $http, toastr, $q) {
    $scope.data = [
      {
        productId: '111',
        userId: 'x214534',
        userName: 'Fortes Diego',
        userEmail: 'frtes@frotes.com',
        date: '3 days ago'
      },
      {
        productId: '222',
        userId: 'x214534',
        userName: 'Fortes Diego',
        userEmail: 'frtes@frotes.com',
        date: '3 days ago'
      },
      {
        productId: '333',
        userId: 'x214534',
        userName: 'Fortes Diego',
        userEmail: 'frtes@frotes.com',
        date: '3 days ago'
      },
      {
        productId: '444',
        userId: 'x214534',
        userName: 'Fortes Diego',
        userEmail: 'frtes@frotes.com',
        date: '3 days ago'
      },
      {
        productId: '555',
        userId: 'x214534',
        userName: 'Fortes Diego',
        userEmail: 'frtes@frotes.com',
        date: '3 days ago'
      }
    ]
  }
])
