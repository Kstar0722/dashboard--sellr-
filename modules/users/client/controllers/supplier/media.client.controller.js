'use strict';

angular.module('users.supplier').controller('MediaController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService','constants', 'toastr', 'uploadService',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService,constants,toastr, uploadService) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        $scope.files = [];
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

            for (var i = 0; i < files.length; i++) {
                var mediaConfig = {
                    mediaRoute: 'media',
                    type: 'SUPPLIER',
                    folder: 'supplier',
                    accountId: localStorage.getItem('accountId')
                };
                uploadService.upload(files[i], mediaConfig).then(function (response, err) {
                    console.log('mediaController::upload response %O', response);
                    if (response) {
                        toastr.success('New File Uploaded', 'Success!');
                        $scope.uploadedFile = response[ 0 ]
                        $scope.files = [];
                    }
                    else {
                        toastr.error('There was a problem uploading ads')
                    }
                })
            }
        }
    }

]);

