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
        console.log($scope.ga);
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
                      startDate: $scope.ga.start,
                      endDate: $scope.ga.end
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

  $scope.init = function() {
    $scope.ga = {
      start: 'Yesterday',
      end: 'Today'
    };
  }

  $scope.init();

  $scope.googleSessionNumber();
}).directive('gaTimePicker', function() {
  return {
    link($scope, element, attrs) {
      element.find('input').datepicker({
        minDate: new Date('2005-01-01'),
        maxDate: new Date(),
        onSelect(formatted, date) {
          $scope.ga[attrs.type] = new Date(formatted).toISOString().split('T')[0];
          $scope.googleSessionNumber();
        }
      });
    },
    template(element, attrs) {
      return `<input type="text" placeholder="Select a Date" class="common-btn-gray" ng-model="ga.${attrs.type}"><!--<i class="fa fa-calendar"></i>-->`
    }
  }
});
