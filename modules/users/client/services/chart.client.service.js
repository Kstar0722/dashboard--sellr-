angular.module('core').service('chartService', function ($http, $q, constants) {
    var me = this;
    me.groupAndFormatDate = groupAndFormatDate;
    me.data = [
        [0],
        [0]
    ];
    me.labels = [];
    me.series = ['Sku Scans', 'Page Views'];
    me.colors = [{
        fillColor: "#B4B7B9",
        strokeColor: "#B4B7B9",
        pointColor: "#B4B7B9",
        pointStrokeColor: "#B4B7B9",
        pointHighlightFill: "#B4B7B9",
        pointHighlightStroke: "#B4B7B9"

    }, {
        fillColor: "#3299BB",
        strokeColor: "#3299BB",
        pointColor: "#3299BB",
        pointStrokeColor: "#3299BB",
        pointHighlightFill: "#3299BB",
        pointHighlightStroke: "#3299BB"

    }]



    function getChartData(accountId) {
        me.data = [
            [0],
            [0]
        ];
        me.labels = [];
        accountId = accountId || localStorage.getItem('accountId');
            //Get Analytics from API
        var defer = $q.defer();
        var results = {
            sku: [],
            page: []
        }

        $http.get(constants.API_URL + '/analytics?category=sku&account=' + accountId).then(function(res) {
            me.skuData = res.data;
            console.log('skus by account %O', res)
            results.sku = res.data.reverse();
            //Get Analytics for Page Views, Second Array
            $http.get(constants.API_URL + '/analytics?category=pageview&account=' + accountId).then(function(pageViewRes) {
                me.pageData = pageViewRes.data
                results.page = pageViewRes.data.reverse();
                defer.resolve(results)
            });
        });


        return defer.promise
    }

    function groupAndFormatDate(accountId) {
        getChartData(accountId).then(function(results) {
            results.sku.forEach(function(analytic) {
                var message = analytic.analyticsId + ' ';
                var date = moment(analytic.createdDate.split('T')[0]).format('MMM DD');
                var i = me.labels.indexOf(date);
                if (i < 0) {
                    //add new label
                    me.labels.push(date)
                    i = me.labels.indexOf(date);
                    message += 'added new label '
                }
                if (me.data[0][i]) {
                    me.data[0][i]++
                        message += 'incremented data point '
                } else {
                    me.data[0][i] = 1
                    message += 'added new data point '
                }
                //console.log(message)
            });

            results.page.forEach(function(analytic) {
                var message = 'page: ' + analytic.analyticsId;
                var date = moment(analytic.createdDate.split('T')[0]).format('MMM DD');
                var i = me.labels.indexOf(date);
                if (i < 0) {
                    me.labels.push(date)
                    i = me.labels.indexOf(date);

                }
                if (me.data[1][i]) {
                    me.data[1][i]++;
                    message += 'incremented data point '
                } else {
                    me.data[1][i] = 1;
                    message += 'added new data point '
                }
                //console.log(message)

            })

            //add a 0 data point for every label point that doesnt have data
            for (var i = 0; i < me.labels.length; i++) {
                if (!me.data[0][i]) {
                    me.data[0][i] = 0
                }
                if (!me.data[1][i]) {
                    me.data[1][i] = 0
                }
            }
        })

    }

    groupAndFormatDate();


    return me;
});
