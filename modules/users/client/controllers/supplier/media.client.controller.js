'use strict';

angular.module('users.supplier').controller('MediaController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService','constants', 'toastr', 'uploadService',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService,constants,toastr, uploadService) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        var files = [];
        $scope.links = [];

        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });
        $scope.$watch('file', function () {
            if ($scope.file != null) {
                $scope.files = [$scope.file];
            }
        });

        $scope.upload = function(files) {
            var mediaConfig = {
                mediaRoute: 'ads',
                folder:'supplier',
                accountId: localStorage.getItem('accountId')
            };
            uploadService.upload(files, mediaConfig).then(function(response, err ){
                if(response) {
                    toastr.success('New Ad Uploaded', 'Success!');
                }
                else{
                    toastr.error('There was a problem uploading ads')
                }
            })
        }
    }

]);

