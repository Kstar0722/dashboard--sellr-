'use strict';

angular.module('users.manager').controller('DashboardController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'chartService', 'accountsService',
    function($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, chartService, accountsService) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        $scope.myPermissions = localStorage.getItem('roles');
        $scope.selectAccountId = localStorage.getItem('accountId');
        $scope.chartService = chartService;
        $scope.accountsService = accountsService;
        $scope.onClick = function(points, evt) {
            console.log(points, evt);
        };

        $scope.chartOptions = {}
        $scope.init = function() {
            $scope.emails = [];
            $scope.phones = [];
            $scope.loyalty = [];
            $scope.analytics = [];
            var locations = [];
            var location;
            $scope.list_devices = [];
            $scope.stores = [];
            $scope.specificLoc = [];
            chartService.groupAndFormatDate($scope.selectAccountId)
            $scope.sources = [];
            $http.get(constants.API_URL + '/locations?account=' + $scope.selectAccountId).then(function(res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    locations = res.data;
                    for (var x in locations) {
                        location = locations[x].address;
                        $scope.specificLoc.push({
                            locationName: locations[x].address,
                            locationId: locations[x].locationId
                        })
                        $http.get(constants.API_URL + '/devices/location/' + locations[x].locationId).then(function(response, err) {
                            if (err) {
                                console.log(err);
                            }
                            if (response.data) {
                                for (var i in response.data) {

                                    $scope.list_devices.push({
                                        deviceName: response.data[i].name || '',
                                        locationId: response.data[i].location_locationId
                                    });
                                }
                            }
                        });
                    }
                }

            })



            //TODO:add loyalty by accountId
            $http.get(constants.API_URL + '/loyalty/' + $scope.authentication.user.username).then(function(res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    for (var i in res.data) {
                        var contact = JSON.parse(res.data[i].contactInfo);
                        if (contact["email"]) {
                            $scope.emails.push({
                                email: contact['email']
                            });
                        } else {
                            $scope.phones.push({
                                phone: contact['phone']
                            });

                        }

                    }
                }
            });

            var url = constants.API_URL + '/analytics/top-products?account=' + $scope.selectAccountId;
            $http.get(url).then(function(res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    console.log('analytics topProducts %O', res);
                    for (var i in res.data) {
                        if (res.data[i].action == 'Product-Request') {
                            $scope.analytics.push(res.data[i])
                        }
                    }
                }
            });

        };
    }

]);