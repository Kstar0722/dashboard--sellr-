angular.module('core').controller('StoreOwnerHomeController', function ($scope, accountsService, $stateParams, $state, $http) {
  console.log('LISTED PRODUCTS CTRL')

  var googleSessionNumber = function getGoogleSessionCount() {
  	$scope.websiteTraffic = 0;
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

  googleSessionNumber();
})
