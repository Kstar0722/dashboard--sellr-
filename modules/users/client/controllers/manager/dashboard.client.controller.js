'use strict';

angular.module('users.manager').controller('DashboardController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;


        $scope.labels = [];
        $scope.series = ['Scans', 'Product views'];
        $scope.data = [
            [0],
            [0, 0]
        ];
        $http.get('http://localhost:7272/analytics?category=sku').then(function (res) {
            //Get Analytics for Sku Scans, first array
            $scope.data[0] = [];
            $scope.labels = [];

            console.log('response from /analytics?category=sku %O', res)

            //group by day scanned
            var groupedData = _.groupBy(res.data, function (analytic) {
                return analytic.createdDate.split('T')[0]
            });
            //var sortedData = _.sortBy(groupedData,'')
            $scope.labels = [];
            Object.keys(groupedData).forEach(function (skuScanDate) {
                $scope.labels.push(moment(skuScanDate).format("MMM DD"))
            })
            for (var analytic in groupedData) {
                $scope.data[0].push(groupedData[analytic].length)
            }
            console.log('groupedData %O', groupedData)

        })

        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };

        $scope.colors = [
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

        $scope.chartOptions = {}


        $scope.emails = [];
        $scope.phones = [];
        $scope.loyalty = [];
        $scope.analytics = [];
        var locations = [];
        var location;
        $scope.list_devices = [];
        $scope.stores = [];
        $scope.specificLoc = [];
        $scope.init = function () {
            $scope.sources = [];
            $http.get(constants.API_URL + '/store/location/' + $scope.authentication.user.username).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {

                    locations = res.data;

                    for (var x in locations) {
                        location = locations[x].address;
                        $scope.specificLoc.push({locationName: locations[x].address, locationId: locations[x].locationId})
                        $http.get(constants.API_URL + '/devices/location/' + locations[x].locationId).then(function (response, err) {
                            if (err) {
                                console.log(err);
                            }
                            if (response) {
                                for (var i in response.data) {
                                    $scope.list_devices.push({
                                        deviceName: response.data[i].name,
                                        locationId: response.data[i].location_locationId
                                    });
                                }
                            }
                        });
                    }
                }

            })


            $http.get(constants.API_URL + '/loyalty/' + $scope.authentication.user.username).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    for (var i in res.data) {
                        var contact = JSON.parse(res.data[i].contactInfo);
                        if (contact["email"]) {
                            $scope.emails.push({email: contact['email']});
                        }
                        else {
                            $scope.phones.push({phone: contact['phone']});

                        }

                    }
                }
            });
            var accountId = localStorage.getItem('accountId');
            $http.get(constants.API_URL + '/analytics/top-products?account=' + accountId).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    for (var i in res.data) {
                        $scope.analytics.push(res.data[i])
                    }
                    console.log($scope.analytics)
                }
            });

        };
    }

]);
