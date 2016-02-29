'use strict';

angular.module('users.manager').controller('DashboardController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;


        $scope.labels = ["2/22", "2/23", "2/24", "2/25", "2/26", "2/27", "2/28"];
        $scope.series = ['My first dataset', 'My Second dataset'];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [0, 0, 0, 0, 86, 27, 90]
        ];
        $scope.colors = [
            {
                fillColor: "rgba(220,110,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)"

            },
            {
                fillColor: "rgba(110,220,220,0.5)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)"

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
