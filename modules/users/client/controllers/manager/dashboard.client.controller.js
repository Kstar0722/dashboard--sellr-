'use strict';

angular.module('users.manager').controller('DashboardController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
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
            $http.get('http://mystique.expertoncue.com:7272/store/location/' + $scope.authentication.user.username).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {

                  locations = res.data;

                    for(var x in locations) {
                        location = locations[x].address;
                        $scope.specificLoc.push({locationName:locations[x].address, locationId:locations[x].locationId})
                        $http.get('http://mystique.expertoncue.com:7272/devices/location/' + locations[x].locationId).then(function (response, err) {
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


            $http.get('http://mystique.expertoncue.com:7272/loyalty/' + $scope.authentication.user.username).then(function (res, err) {
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
            var accountId= localStorage.getItem('accountId');
            $http.get('http://mystique.expertoncue.com:7272/analytics/top-products?account=' + accountId).then(function (res, err) {
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
