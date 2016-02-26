'use strict';

angular.module('users.manager').controller('LoyaltyManagerController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        $scope.emails = [];
        $scope.phones = [];
        $scope.loyalty = [];
        $scope.init = function () {
            $scope.sources = [];
            $http.get('http://mystique.expertoncue.com:7272/loyalty/' + $scope.authentication.user.username).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    console.log(res.data.contactInfo);
                    for (var i in res.data) {
                        console.log(JSON.parse(res.data[i].contactInfo));
                        var contact = JSON.parse(res.data[i].contactInfo);

                        if (contact["email"]) {
                            $scope.emails.push(contact['email']);
                            $scope.loyalty.push(JSON.stringify(contact['email']));
                        }
                        else {
                            $scope.phones.push(JSON.stringify(contact['phone']));
                            $scope.loyalty.push(JSON.stringify(contact['phone']));
                        }
                    }
                }
            });

        };

    }

]);
