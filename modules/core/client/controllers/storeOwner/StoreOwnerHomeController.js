angular.module('core').controller('StoreOwnerHomeController', function ($scope, accountsService, $stateParams, $state, $http) {
  console.log('LISTED PRODUCTS CTRL')

  $scope.charts = new Array();

  $scope.stats = {
    overview: {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Visitors',
            borderColor: '#313d4f',
            backgroundColor: 'transparent',
            fill: false,
            data: []
          },
          /*{
            label: 'Page Views',
            borderColor: '#2bbf88',
            backgroundColor: 'transparent',
            fill: false,
            data: []
          }*/
        ]
      },
      options: {
        elements: {
          line: {
            tension: 0
          }
        }
      }
    }
  };

  $scope.range = {
    start: new Date(new Date() - (24 * 60 * 60 * 1000) * 7),
    end: new Date(),
    min: new Date('2005-01-01'),
    max: new Date(),
    labels: [],
    data: []
  };

  $scope.analytics = {
    google: {
      report: null,
      sources: null,
      visitors: 0,
      views: null,
      overview: {
        labels: []
      }
    },
    facebook: {}
  };

  $scope.init = function() {
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
          }).then(function(report) {
            $scope.analytics.google.report = report;
            $scope.ui.update();
          });
        }
      });
    });
  };

  $scope.formatDate = function(date) {
    return date.toISOString().split('T')[0];
  };

  $scope.ui = {
    sources: function(report) {
      $scope.channels.total = parseInt(report);
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
        }
        $scope.channels.all.push({
          source: source,
          amount: amount,
          percent: Math.round(amount / $scope.channels.total * 100),
          color: color
        });
      }
    },
    visitors: function(report) {
      var traffic = report.data.totals[0].values[0];
      $scope.analytics.google.visitors = Number(traffic).toLocaleString();
    },
    views: function() {

    },
    overview: function(report) {
      $scope.analytics.google.overview.labels = [];
      for(var i = 0; i < $scope.stats.overview.data.datasets.length; i++) {
        $scope.stats.overview.data.datasets[i].data = [];
      }
      var date, value, map = {};
      for(var i = 0; i < report.data.rows.length; i++) {
        date = report.data.rows[i].dimensions[0];
        date = `${date.slice(0, 4)}-${date.slice(4,6)}-${date.slice(6)}`;
        date = new Date(date).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        map[date] = parseInt(value);
        $scope.stats.overview.data.labels.push(date);
        $scope.stats.overview.data.datasets[0].data.push(report.data.rows[i].metrics[0].values[0]);
        //$scope.stats.overview.data.datasets[1].data.push(report.data.rows[i].metrics[0].values[1]);
        for(var key in $scope.charts) {
          $scope.charts[key].update();
        }
      }
    },
    update() {
      //$scope.ui.sources($scope.analytics.google.report.data.reports[1]);
      $scope.ui.visitors($scope.analytics.google.report.data.reports[0]);
      $scope.ui.overview($scope.analytics.google.report.data.reports[0]);
    }
  };

  $scope.init();
}).directive('reportChart', function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<canvas></canvas>',
    link($scope, $element) {
      $scope.charts.push(new Chart($element[0].getContext('2d'), $scope.stats.overview));
      console.log($scope.charts);
    }
  };
});
