angular.module('users').service('uploadService', function ($http, constants, toastr, Authentication, $q) {
    var me = this;


    me.init = function () {
        me.selectAccountId = localStorage.getItem('accountId');
        me.accounts = [];
        me.editAccount = {};
        me.currentAccount = {};
        me.files = [];
        me.determinate = {value: 0};

    };

    me.init()


    me.upload = function (file, mediaConfig) {

        var messages = [];
        var defer = $q.defer();
        var config = mediaConfig;
        if (file) {
            var filename = (file.name).replace(/ /g, "_");

            if (!file.$error) {

                var newObject;
                if (config.mediaRoute == 'media') {
                    if (config.type == 'PRODUCT') {
                        newObject = {
                            payload: {
                                fileName: filename,
                                userName: Authentication.user.username,
                                type: config.type,
                                fileType: config.fileType,
                                accountId: config.accountId,
                                productId: config.productId
                            }
                        };
                    }
                    else {
                        newObject = {
                            payload: {
                                type: config.type,
                                fileType: config.type,
                                fileName: filename,
                                userName: Authentication.user.username,
                                accountId: config.accountId
                            }
                        };
                    }
                }
                else {
                    newObject = {
                        payload: {
                            fileName: filename,
                            userName: Authentication.user.username,
                            accountId: config.accountId
                        }
                    };
                }
                

                $http.post(constants.API_URL + '/' + config.mediaRoute, newObject).then(function (response, err) {
                    if (err) {
                        console.log(err);
                        toastr.error('There was a problem uploading your ad.')


                    }
                    if (response) {
                        var mediaAssetId = response.data.assetId;
                        var creds = {
                            bucket: 'cdn.expertoncue.com/' + config.folder,
                            access_key: 'AKIAICAP7UIWM4XZWVBA',
                            secret_key: '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'
                        };
                        // Configure The S3 Object

                        var params = {
                            Key: response.data.assetId + "-" + filename,
                            ContentType: file.type,
                            Body: file,
                            ServerSideEncryption: 'AES256',
                            Metadata: {
                                fileKey: JSON.stringify(response.data.assetId)
                            }
                        };
                        bucketUpload(creds, params).then(function (err, res) {
                            self.determinateValue = 0;
                            var updateMedia = {
                                payload: {
                                    mediaAssetId: mediaAssetId,
                                    publicUrl: 'https://s3.amazonaws.com/' + creds.bucket + '/' + response.data.assetId + "-" + filename
                                }
                            };

                            $http.put(constants.API_URL + '/media', updateMedia).then(function (res2, err) {
                                if (err) {
                                    console.log(err)
                                }
                                else {
                                    var message = {
                                        message: 'New Ad Uploaded Success!',
                                        publicUrl: updateMedia.payload.publicUrl,
                                        fileName: filename,
                                        mediaAssetId:updateMedia.payload.mediaAssetId
                                    };
                                    messages.push(message);
                                    defer.resolve(messages)
                                }
                            })
                        }, null, defer.notify)
                    }
                })
            }
        }

        return defer.promise
    };

    function bucketUpload(creds, params) {
        var defer = $q.defer();
        AWS.config.update({
            accessKeyId: creds.access_key,
            secretAccessKey: creds.secret_key
        });
        AWS.config.region = 'us-east-1';
        var bucket = new AWS.S3({
            params: {
                Bucket: creds.bucket
            }
        });

        var request = bucket.putObject(params, function (err, data) {
            me.loading = true;
            if (err) {
                // There Was An Error With Your S3 Config
                alert(err.message);
                toastr.error('There was a problem uploading your ad.');
                defer.reject(false)
            } else {
                defer.resolve(data)
            }
        });

        request.on('httpUploadProgress', function (progress) {
            defer.notify(Math.round(progress.loaded / progress.total * 100));
        });

        return defer.promise;
    }

    return me;
});

