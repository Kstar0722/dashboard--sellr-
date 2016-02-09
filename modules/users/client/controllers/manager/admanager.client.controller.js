'use strict';

angular.module('users.supplier').controller('AdmanagerController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        var array = [];

        function buildArray(name, value) {
            array.push({
                name: name,
                value: value
            });
            return array;
        }

        $scope.links = [];
        $scope.sortingLog = [];
        $scope.rightArray = [];
        $scope.init = function () {
            $http.get('http://api.expertoncue.com:443/media/' + $scope.authentication.user.username).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    for (var i in response.data) {
                        var myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName};

                        $scope.links.push(myData.value.length);

                        $scope.leftArray = buildArray('Left', myData.value);

                    }
                }
            });
        }
        $scope.sortableOptions = {
            connectWith: '.connectedItemsExample .list'
        };

    }

]);

