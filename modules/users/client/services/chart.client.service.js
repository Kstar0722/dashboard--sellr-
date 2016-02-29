angular.module('users').service('chartService', function ($http, $q, constants) {
    var me = this;

    me.data = [[0], [0]];
    me.labels = [];
    me.series = ['Sku Scans', 'Page Views'];
    me.groupedData = [];
    me.colors = [
        {
            fillColor: "#FE3A6D",
            strokeColor: "#FE3A6D",
            pointColor: "#FE3A6D",
            pointStrokeColor: "#FE3A6D",
            pointHighlightFill: "#FE3A6D",
            pointHighlightStroke: "#FE3A6D"

        },
        {
            fillColor: "#3299BB",
            strokeColor: "#3299BB",
            pointColor: "#3299BB",
            pointStrokeColor: "#3299BB",
            pointHighlightFill: "#3299BB",
            pointHighlightStroke: "#3299BB"

        }
    ]


    function getChartData() {
        //Get Analytics from API
        var defer = $q.defer();
        var results = {
            sku: [],
            page: []
        }

        $http.get(constants.API_URL + '/analytics?category=sku').then(function (res) {
            results.sku = res.data.reverse()
            //Get Analytics for Page Views, Second Array
            $http.get(constants.API_URL + '/analytics?category=pageview').then(function (pageViewRes) {
                results.page = pageViewRes.data.reverse()
                defer.resolve(results)
            });
        });


        return defer.promise
    }

    function groupAndFormatDate() {
        getChartData().then(function (results) {
            //console.log('chartService results %O', results)

            results.sku.forEach(function (analytic) {
                var date = moment(analytic.createdDate.split('T')[0]).format('MMM DD');
                var i = me.labels.indexOf(date);
                if (i < 0) {
                    //console.log('chartService pushing new date')
                    me.labels.push(date)
                }
                if (me.data[0][i]) {
                    //console.log('chartService incrementing data count for day')
                    me.data[0][i]++
                } else {
                    //console.log('chartService adding data point for day')
                    me.data[0][i] = 1
                }
            });
            //console.log('chartService1 me.data %O', me.data)
            results.page.forEach(function (analytic) {
                var date = moment(analytic.createdDate.split('T')[0]).format('MMM DD');
                var i = me.labels.indexOf(date);
                if (i < 0) {
                    me.labels.push(date)
                }
                if (me.data[1][i]) {
                    me.data[1][i]++
                } else {
                    me.data[1][i] = 1
                }
            })
            //console.log('chartService2 me.data %O', me.data)
        })
    }

    groupAndFormatDate();


    return me;
})
;
