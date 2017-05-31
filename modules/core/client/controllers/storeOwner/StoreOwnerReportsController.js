angular.module('core').controller('StoreOwnerReportsController', function ($scope, $stateParams, $state, accountsService, $http) {
  $scope.range = {
    start: new Date(new Date() - (24 * 60 * 60 * 1000) * 7),
    end: new Date(),
    min: new Date('2005-01-01'),
    max: new Date(),
    labels: [],
    data: []
  };

  $scope.channels = {
    all: [],
    total: 0
  };

  $scope.chart = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Sessions',
          borderColor: '#313d4f',
          backgroundColor: 'transparent',
          fill: false,
          data: []
        },
        {
          label: 'Page Views',
          borderColor: '#2bbf88',
          backgroundColor: 'transparent',
          fill: false,
          data: []
        }
      ]
    },
    options: {
      elements: {
        line: {
          tension: 0
        }
      }
    }
  };

  $scope.init = function() {
    accountsService.getAccount().then(function(account) {
      if(!account.preferences.analytics) {
        return;
      }
      if(!account.preferences.analytics.item) {
        return;
      }
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
                      startDate: $scope.formatDate($scope.range.start),
                      endDate: $scope.formatDate($scope.range.end)
                    }
                  ],
                  dimensions: [
                    {
                      name: 'ga:date'
                    }
                  ],
                  metrics: [
                    {
                      expression: 'ga:sessions'
                    },
                    {
                      expression: 'ga:pageviews'
                    }
                  ]
                },
                {
                  viewId: account.preferences.analytics.item,
                  dateRanges: [
                    {
                      startDate: $scope.formatDate($scope.range.start),
                      endDate: $scope.formatDate($scope.range.end)
                    }
                  ],
                  dimensions: [
                    {
                      name: 'ga:medium'
                    }
                  ]
                }
              ]
            }
          }).then(function(stats) {
            $scope.channels.total = parseInt(stats.data.reports[1].data.totals[0].values[0]);
            $scope.channels.all = [];
            var source, amount, color = 'white';
            for(var i = 0; i < stats.data.reports[1].data.rows.length; i++) {
              source = stats.data.reports[1].data.rows[i].dimensions[0];
              amount = parseInt(stats.data.reports[1].data.rows[i].metrics[0].values[0]);
              switch(source) {
                case '(none)':
                  source = 'Direct';
                  color = '#2bbf88';
                  break;
                case 'organic':
                  source = 'Organic Search';
                  color = '#848c98';
                  break;
                case 'referral':
                  source = 'Referral';
                  color = '#ffa700';
                  break;
                default:
                  continue;
              }
              $scope.channels.all.push({
                source: source,
                amount: amount,
                percent: Math.round(amount / $scope.channels.total * 100),
                color: color
              });
            }
            $scope.chart.data.labels = [];
            for(var i = 0; i < $scope.chart.data.datasets.length; i++) {
              $scope.chart.data.datasets[i].data = [];
            }
            var date, value, map = {};
            for(var i = 0; i < stats.data.reports[0].data.rows.length; i++) {
              date = stats.data.reports[0].data.rows[i].dimensions[0];
              date = `${date.slice(0, 4)}-${date.slice(4,6)}-${date.slice(6)}`;
              date = new Date(date).toLocaleString('en-US', {
              	month: 'short',
              	day: 'numeric'
              });
              map[date] = parseInt(value);
              $scope.chart.data.labels.push(date);
              $scope.chart.data.datasets[0].data.push(stats.data.reports[0].data.rows[i].metrics[0].values[0]);
              $scope.chart.data.datasets[1].data.push(stats.data.reports[0].data.rows[i].metrics[0].values[1]);
              if($scope.chartui) {
                $scope.chartui.update();
              }
            }
          });
        }
      });
    });
  };

  $scope.formatDate = function(date) {
    return date.toISOString().split('T')[0];
  }

  $scope.ui = {}
  $scope.ui.activeTab = 'website'
  $scope.changeTab = function (tab) {
    $scope.ui.activeTab = tab
    $state.go('storeOwner.reports.' + tab)
  }

  $scope.init();
});
