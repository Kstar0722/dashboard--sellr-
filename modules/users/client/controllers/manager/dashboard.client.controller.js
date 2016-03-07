'use strict';

angular.module('users.manager').controller('DashboardController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'chartService',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, chartService) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;


        $scope.chartService = chartService;



        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };

        $scope.colors = [
            {
                fillColor: "#B4B7B9",
                strokeColor: "#B4B7B9",
                pointColor: "#B4B7B9",
                pointStrokeColor: "#B4B7B9",
                pointHighlightFill: "#B4B7B9",
                pointHighlightStroke: "#B4B7B9"

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
            var url = constants.API_URL + '/analytics/top-products?account=' + accountId;
            console.log('analytics topProducts %O', url)
            $http.get(url).then(function (res, err) {
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
