'use strict';

angular.module('users.supplier').controller('MediaController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        //var files3 = '';
        $scope.links = [];
        function encode(data) {
            var str = data.reduce(function (a, b) {
                return a + String.fromCharCode(b)
            }, '');
            return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
        }


        $scope.upload = function (file) {
            var obj = {
                payload: {
                    fileName: file[0].name,
                    userName: $scope.authentication.user.username
                }
            };
            $http.post('http://api.expertoncue.com:443/media', obj).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.creds = {
                        bucket: 'beta.cdn.expertoncue.com',
                        access_key: 'AKIAICAP7UIWM4XZWVBA',
                        secret_key: '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'
                    }
                    // Configure The S3 Object
                    AWS.config.update({
                        accessKeyId: $scope.creds.access_key,
                        secretAccessKey: $scope.creds.secret_key
                    });
                    AWS.config.region = 'us-east-1';
                    var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});

                    //if (file) {
                    var params = {
                        Key: response.data.assetId + "-" + file[0].name,
                        ContentType: file[0].type,
                        Body: file[0],
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
                                        return false;
                                    }
                                    else {
                                        console.dir(data);
                                        // Success!


                                        alert('Upload Done');

                                    }
                                })
                                .on('httpUploadProgress', function (progress) {
                                    // Log Progress Information

                                    console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                                    self.determinateValue = Math.round(progress.loaded / progress.total *100);
                                    $scope.$apply();
                                    //$scope.$apply();
                                    //console.log($scope.data.loading);
                                    //$scope.loading = (progress.loaded / progress.total *100);

                                });
                        }
                        else {
                            // No File Selected
                            alert('No File Selected');
                        }
            });
            //}

        };
    }

]);

