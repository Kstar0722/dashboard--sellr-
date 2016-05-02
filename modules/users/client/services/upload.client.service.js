angular.module('users').service('uploadService', function ($http, constants, toastr, Authentication, $q) {
    var me = this;


    me.init = function () {
        me.selectAccountId = localStorage.getItem('accountId');
        me.accounts = [];
        me.editAccount = {};
        me.currentAccount = {};
        me.files = [];
        me.loading;
        me.determinate = {value:0};

    };

    me.init()


    me.upload = function(files, mediaConfig){

        var defer = $q.defer();
        console.log('upload service called %0', files);
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (!file.$error) {
                    var filename = (file.name).replace(/ /g, "_");
                    console.log('account id %O', localStorage.getItem('accountId'));
                    if(mediaConfig.mediaRoute == 'media') {
                        if(mediaConfig.type == 'PRODUCT') {
                            var obj = {
                                payload: {
                                    fileName: filename,
                                    userName: Authentication.user.username,
                                    type:mediaConfig.type,
                                    fileType:mediaConfig.fileType,
                                    accountId: mediaConfig.accountId,
                                    productId:mediaConfig.productId
                                }
                            };
                        }
                        else{
                            var obj = {
                                payload: {
                                    type: mediaConfig.type,
                                    fileType:mediaConfig.type,
                                    fileName: filename,
                                    userName: Authentication.user.username,
                                    accountId: mediaConfig.accountId
                                }
                            };
                        }
                    }
                    else {
                        var obj = {
                            payload: {
                                fileName: filename,
                                userName: Authentication.user.username,
                                accountId: mediaConfig.accountId
                            }
                        };
                    }
                    console.log('upload service object %0', obj)
                    $http.post(constants.API_URL +'/'+ mediaConfig.mediaRoute, obj).then(function (response, err) {

                        if (err) {
                            console.log(err);
                            toastr.error('There was a problem uploading your ad.')


                        }
                        if (response) {
                            var  mediaAssetId = response.data.assetId;
                            console.log(response);
                             var creds = {
                                bucket: 'cdn.expertoncue.com/'+mediaConfig.folder,
                                access_key: 'AKIAICAP7UIWM4XZWVBA',
                                secret_key: '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'
                            };
                            // Configure The S3 Object
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
                                    me.loading = true;
                                    if (err) {
                                        // There Was An Error With Your S3 Config
                                        alert(err.message);
                                        toastr.error('There was a problem uploading your ad.');
                                        return false;
                                    } else {

                                        // Success!
                                        self.determinateValue = 0;
                                        var updateMedia = {
                                            payload: {
                                                mediaAssetId: mediaAssetId,
                                                publicUrl: 'https://s3.amazonaws.com/cdn.expertoncue.com/' + mediaConfig.folder + '/' + response.data.assetId + "-" + filename
                                            }
                                        };
                                        console.log(updateMedia);
                                        $http.put(constants.API_URL +'/media', updateMedia).then(function (response, err) {
                                            if(err){
                                                console.log(err)
                                            }
                                            else {
                                                var message = {
                                                    message: 'New Ad Uploaded Success!',
                                                    publicUrl: updateMedia.publicUrl,
                                                    fileName: filename
                                                };
                                                defer.resolve(message)
                                            }
                                        })
                                    }
                                })
                                .on('httpUploadProgress', function (progress) {
                                    // Log Progress Information
                                    console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
                                    me.determinate.value = Math.round(progress.loaded / progress.total * 100);

                                });
                        } else {
                            // No File Selected
                            alert('No File Selected');
                        }

                    });

                }
            }
        }
        return defer.promise
    };



    return me;
});

