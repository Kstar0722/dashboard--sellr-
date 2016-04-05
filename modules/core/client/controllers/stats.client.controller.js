angular.module('core').controller('statsController', function ($scope, $http, $stateParams, constants, chartService, $timeout) {
    $scope.chartService = chartService;
    $scope.locations = [];
    var accountId = $stateParams.account;       //set by the URL
    var refreshInterval = 60;                   //how often data refreshes, in seconds;

    function refreshData() {
        $scope.locations = [];
        getDevicesLocations();
        chartService.groupAndFormatDate(accountId);

        //after 30 seconds, recursively refresh data
        $timeout(function () {
            refreshData()
        }, refreshInterval * 1000)
    }

    localStorage.clear()

    function getDevicesLocations() {
        $http.get(constants.API_URL + '/locations?account=' + accountId).then(function (res, err) {
            if (err) {
                console.log(err);
            }
            if (res.data.length > 0) {
                //this account has at least one location
                res.data.forEach(function (thisLocation) {
                    thisLocation.devices = [];
                    $http.get(constants.API_URL + '/devices/location/' + thisLocation.locationId).then(function (response, err) {
                        if (err) {
                            console.log(err);
                        }
                        if (response.data.length > 0) {
                            //this location has devices, add to that location
                            response.data.forEach(function (device) {
                                console.log(device);
                                console.log(device.niceDate);

                                //check to see if device is unhealthy
                                var rightNow = moment();
                                var time = moment(device.lastCheck).subtract(4, 'hours');
                                device.moment = moment(time).fromNow();

                                //determines what classifies as 'unhealthy'
                                var timeDiff = time.diff(rightNow, 'minutes');
                                device.unhealthy = timeDiff <= -60;

                            });
                            thisLocation.devices = response.data || [];
                            $scope.locations.push(thisLocation)
                        }
                    });
                })
            }
        })
    }


    //call the function on load to start the loop.
    refreshData()


});
