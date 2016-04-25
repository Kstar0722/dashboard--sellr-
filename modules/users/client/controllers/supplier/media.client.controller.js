'use strict';

angular.module('users.supplier').controller('MediaController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService','constants', 'toastr',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService,constants,toastr) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        var files = [];
        $scope.links = [];
        function encode(data) {
            var str = data.reduce(function (a, b) {
                return a + String.fromCharCode(b)
            }, '');
            return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
        }
        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });
        $scope.$watch('file', function () {
            if ($scope.file != null) {
                $scope.files = [$scope.file];
            }
        });

        $scope.upload = function(files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (!file.$error) {
                        var filename = (file.name).replace(/ /g, "_");
                        console.log('account id %O', localStorage.getItem('accountId'))
                        var obj = {
                            payload: {
                                fileName: filename,
                                userName: $scope.authentication.user.username,
                                accountId: localStorage.getItem('accountId')
                            }
                        };
                        $http.post(constants.API_URL + '/ads', obj).then(function (response, err) {
                            if (err) {
                                console.log(err);
                                toastr.error('There was a problem uploading your ad.')
                            }
                            if (response) {
                                console.log(response);
                                $scope.creds = {
                                    bucket: 'cdn.expertoncue.com/supplier',
                                    access_key: 'AKIAICAP7UIWM4XZWVBA',
                                    secret_key: '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'
                                };
                                // Configure The S3 Object
                                AWS.config.update({
                                    accessKeyId: $scope.creds.access_key,
                                    secretAccessKey: $scope.creds.secret_key
                                });
                                AWS.config.region = 'us-east-1';
                                var bucket = new AWS.S3({
                                    params: {
                                        Bucket: $scope.creds.bucket
                                    }
                                });
                                var params = {
                                    Key: response.data.assetId + "-" + filename,
                                    ContentType: file.type,
                                    Body: file,
                                    ServerSideEncryption: 'AES256',
                                    Metadata: {
                                        fileKey: JSON.stringify(response.data.assetId)
                                    }
                                };
                                console.dir(params.Metadata.fileKey)
                                bucket.putObject(params, function (err, data) {
                                        $scope.loading = true;
                                        if (err) {
                                            // There Was An Error With Your S3 Config
                                            alert(err.message);
                                            toastr.error('There was a problem uploading your ad.');
                                            return false;
                                        } else {
                                            console.dir(data);
                                            // Success!
                                            self.determinateValue = 0;
                                            toastr.success('New Ad Uploaded', 'Success!');

                                        }
                                    })
                                    .on('httpUploadProgress', function (progress) {
                                        // Log Progress Information
                                        console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                                        self.determinateValue = Math.round(progress.loaded / progress.total * 100);
                                        $scope.$apply();
                                    });
                            } else {
                                // No File Selected
                                alert('No File Selected');
                            }
                        });
                    };
                }
            }
        }
    }

]);

