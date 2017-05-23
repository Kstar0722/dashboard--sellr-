angular.module('core').controller('StoreOwnerHomeController', function ($scope, accountsService, $stateParams, $state, $http) {
  console.log('LISTED PRODUCTS CTRL')

  $scope.googleSessionNumber = function() {
    if(!$scope.websiteTraffic) {
      $scope.websiteTraffic = 0;
    }
    accountsService.getAccount().then(function(account) {
      if(!account.preferences.analytics) {
        return;
      }
      if(!account.preferences.analytics.item) {
        return;
      }
      /*
        TODO: make this a promise which checks local storage for existing
        access token and compares it to the time it was issued. If it expired,
        refresh the token.
      */
      $.ajax({
        type: 'POST',
        url: 'https://www.googleapis.com/oauth2/v4/token',
        data: {
          client_id: '980923677656-4td6h98v1s9gd05kg3i9qee787sgsca5.apps.googleusercontent.com',
          client_secret: 'ETc5D1hO_JYb3Wemqhr41jTq',
          grant_type: 'refresh_token',
          refresh_token: account.preferences.analytics.refresh_token
        }
      }).then(function(response) {
        // TODO: not important, but find out why $http won't chain properly
        if(account.preferences.analytics.item) {
          return $http({
            method: 'POST',
            url: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
            contentType: 'application/json',
            headers: {
              'Authorization': `Bearer ${response.access_token}`
            },
            data: {
              reportRequests: [
                {
                  viewId: account.preferences.analytics.item,
                  dateRanges: [
                    {
                      startDate: $scope.formatDate($scope.ga.start),
                      endDate: $scope.formatDate($scope.ga.end)
                    }
                  ],
                  metrics: [
                    {
                      expression: 'ga:sessions'
                    }
                  ]
                }
              ]
            }
          }).then(function(stats) {
            var traffic = stats.data.reports[0].data.totals[0].values[0];
            $scope.websiteTraffic = Number(traffic).toLocaleString();
          });
        }
      });
    });
  }

  $scope.formatDate = function(date) {
    return date.toISOString().split('T')[0];
  }

  $scope.init = function() {
    $scope.ga = {
      start: new Date(),
      end: new Date(),
      min: new Date('2005-01-01'),
      max: new Date()
    }
  }

  $scope.init();

  $scope.googleSessionNumber();
});
