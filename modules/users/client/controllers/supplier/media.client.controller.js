'use strict';

angular.module('users.supplier').controller('MediaController', ['$scope','$state','$http', 'Authentication', '$timeout', 'Upload',
    function ($scope, $state, $http, Authentication, $timeout, Upload) {
        $scope.authentication = Authentication;
        //$scope.file = '';

        $scope.upload = function(file) {




            var obj = {
                payload: {
                    fileName: file[0].name,
                    userName:$scope.authentication.user.username
                }
            };
            $http.post('http://api.expertoncue.com:443/media', obj).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if(response) {
                    $scope.creds = {
                        bucket: 'beta.cdn.expertoncue.com',
                        access_key: 'AKIAICAP7UIWM4XZWVBA',
                        secret_key: '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'
                    }
                    // Configure The S3 Object
                    AWS.config.update({accessKeyId: $scope.creds.access_key, secretAccessKey: $scope.creds.secret_key});
                    AWS.config.region = 'us-east-1';
                    var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});

                    if (file) {
                        var params = {
                            Key: response.data.assetId+"-"+file[0].name,
                            ContentType: file[0].type,
                            Body: file[0],
                            ServerSideEncryption: 'AES256'
                        };
                        console.dir(params.Key)
                        bucket.putObject(params, function (err, data) {
                                if (err) {
                                    // There Was An Error With Your S3 Config
                                    alert(err.message);
                                    return false;
                                }
                                else {
                                    // Success!
                                    alert('Upload Done');

                                }
                            })
                            .on('httpUploadProgress', function (progress) {
                                // Log Progress Information
                                $scope.loading = false;
                                if (progress == 100) {
                                    $scope.loading = true;
                                }
                                console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                            });
                    }
                    else {
                        // No File Selected
                        alert('No File Selected');
                    }

                }
            });
        }
    }
]);

