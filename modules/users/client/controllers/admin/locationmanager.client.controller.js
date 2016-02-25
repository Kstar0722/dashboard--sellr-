'use strict';

angular.module('users.admin').controller('AdminLocationController', ['$scope','$state','$http', 'Authentication', '$timeout','Admin', 'Upload', '$sce', 'ImageService',
    function ($scope, $state, $http, Authentication, $timeout,Admin, Upload, $sce, ImageService) {
        $scope.authentication = Authentication;
        Admin.query(function (data) {
            $scope.users = data;
            $scope.buildPager();
        });
        var self = this;
       $scope.getLocation = function(specificUser) {
           $http.get('http://mystique.expertoncue.com:7272/store/location/' + specificUser).then(function (res, err) {
               if (err) {
                   console.log(err);
               }
               if (res) {

                   $scope.list_categories = res;
                   $scope.storeDevices = true;

               }
           });
       }
    }
]);
