angular.module('core').controller('StoreOwnerHomeController', function ($scope, accountsService, $stateParams, $state, $http) {
  console.log('LISTED PRODUCTS CTRL')

  $scope.mobile = {}
  $scope.mobile.viewTitle = 'Diego Store'

  $scope.tokens = {
    google: null
  };

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
    },
    views: {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Page Views',
            borderColor: '#2bbf88',
            fill: true,
            backgroundColor: 'rgba(43, 191, 136, 0.1)',
            data: [],
            pointBackgroundColor: 'white',
            pointRadius: 4,
            borderWidth: 2,
            borderColor: '#2bbf88'
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [
            {
              display: false
            }
          ],
          yAxes: [
            {
              display: false
            }
          ]
        },
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
    comparison: null,
    labels: [],
    data: []
  };

  $scope.analytics = {
    google: {
      report: null,
      sources: {
        all: [],
        total: 0
      },
      visitors: 0,
      views: 0,
      overview: {
        labels: []
      },
      difference: 0
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
        $scope.tokens.google = response.access_token;
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
    return moment(date).format('YYYY-MM-DD');
  };

  $scope.ui = {
    sources: function(report) {
      $scope.analytics.google.sources.total = parseInt(report.data.totals[0].values[0]);
      $scope.analytics.google.sources.all = [];
      var source, amount, color = 'white';
      for(var i = 0; i < report.data.rows.length; i++) {
        source = report.data.rows[i].dimensions[0];
        amount = parseInt(report.data.rows[i].metrics[0].values[0]);
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
        $scope.analytics.google.sources.all.push({
          source: source,
          amount: amount,
          percent: Math.round(amount / $scope.analytics.google.sources.total * 100),
          color: color
        });
      }
    },
    visitors: function(report) {
      var traffic = report.data.totals[0].values[0];
      $scope.analytics.google.visitors = Number(traffic).toLocaleString();
    },
    increase: function() {
      var start = moment($scope.range.start),
          end = moment($scope.range.end);
      accountsService.getAccount().then(function(account) {
        if(account.preferences.analytics.item) {
          return $http({
            method: 'POST',
            url: 'https://analyticsreporting.googleapis.com/v4/reports:batchGet',
            contentType: 'application/json',
            headers: {
              'Authorization': `Bearer ${$scope.tokens.google}`
            },
            data: {
              reportRequests: [
                {
                  viewId: account.preferences.analytics.item,
                  dateRanges: [
                    {
                      startDate: $scope.formatDate(start.subtract(end.diff(start))),
                      endDate: $scope.formatDate($scope.range.start)
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
          }).then(function(report) {
            var old = parseInt(report.data.reports[0].data.totals[0].values[0]),
                updated = parseInt($scope.analytics.google.visitors.replace(',', '')),
                difference = Math.round(((updated - old) / ((updated + old) / 2)) * 100);
            $scope.analytics.google.difference = difference;
          });
        }
      });
    },
    views: function() {

    },
    overview: function(report) {
      $scope.stats.overview.data.labels = [];
      $scope.stats.views.data.labels = [];
      $scope.stats.overview.data.datasets[0].data = [];
      $scope.stats.views.data.datasets[0].data = [];
      for(var i = 0; i < $scope.stats.overview.data.datasets.length; i++) {
        $scope.stats.overview.data.datasets[i].data = [];
      }
      var date;
      for(var i = 0; i < report.data.rows.length; i++) {
        date = report.data.rows[i].dimensions[0];
        date = `${date.slice(0, 4)}-${date.slice(4,6)}-${date.slice(6)}`;
        date = new Date(date).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        $scope.stats.overview.data.labels.push(date);
        $scope.stats.views.data.labels.push(date);
        $scope.stats.overview.data.datasets[0].data.push(report.data.rows[i].metrics[0].values[0]);
        $scope.stats.views.data.datasets[0].data.push(report.data.rows[i].metrics[0].values[1]);
      }
      $scope.analytics.google.views = new Number(report.data.totals[0].values[1]).toLocaleString();
      for(var key in $scope.charts) {
        $scope.charts[key].update();
      }
    },
    update() {
      $scope.ui.sources($scope.analytics.google.report.data.reports[1]);
      $scope.ui.visitors($scope.analytics.google.report.data.reports[0]);
      $scope.ui.increase();
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
    }
  };
}).directive('viewsChart', function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<canvas></canvas>',
    link($scope, $element) {
      $scope.charts.push(new Chart($element[0].getContext('2d'), $scope.stats.views));
    }
  };
});