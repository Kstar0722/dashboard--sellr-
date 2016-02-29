'use strict';

angular.module('users.manager').controller('AdmanagerController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav','constants',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav,constants) {
        $scope.authentication = Authentication;
        //$scope.file = '  ';
        var self = this;
        var array = [];
        var assignAd;
        $scope.links = [];
        $scope.sources = [];
        $scope.sortingLog = [];
        //$scope.rightArray = [];
        //$scope.list_device = [];
        $scope.rightArray = [];
        $scope.leftArray = [];
        $scope.ads = false;
        $scope.activeAds = false;
        $scope.storeDevices = false;
        $scope.toggleLeft = buildDelayedToggler('left');

        function debounce(func, wait, context) {
            var timer;

            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function () {
                    timer = undefined;
                    func.apply(context, args);
                }, wait || 10);
            };
        }
        function buildDelayedToggler(navID) {
            return debounce(function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        console.log("toggle " + navID + " is done");
                    });
            }, 200);
        }
        $scope.init = function () {
            $scope.sources = [];
            //$http.get(constants.API_URL + '/store/location/' + $scope.authentication.user.username).then(function (res, err) {
            //    if (err) {
            //        console.log(err);
            //    }
            //    if (res) {
            //
            //        $scope.list_categories = res;
            //        $scope.storeDevices = true;
            //
            //    }
            //});
            $http.get(constants.API_URL  +'/profiles?userName=' + "'"+$scope.authentication.user.username+"'").then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {

                    $scope.profiles = res;
                    console.log('hey %O', $scope.profiles)

                }
            });
            $http.get(constants.API_URL + '/media/' + $scope.authentication.user.username).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    console.log(response)
                    for (var i in response.data) {
                        var myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName};


                        var re = /(?:\.([^.]+))?$/;

                        var ext = re.exec(myData.value)[1];
                        ext = ext.toLowerCase();

                        if(ext =='jpg' ||ext =='png' ||ext =='svg' ) {
                            //$scope.media = 'image';
                            //self.news3image = "data:image/jpg;base64," + encode(data.Body);
                            myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'image', adId:response.data[i].adId};
                            $scope.sources.push(myData);
                            //$scope.$apply();
                        }
                        else if(ext =='mp4' ||ext =='mov' || ext =='m4v') {
                            //console.log('video')
                            myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'video', adId:response.data[i].adId};
                            //$scope.media = 'video';
                            $scope.sources.push(myData);
                            //self.news3image = $sce.trustAsResourceUrl('http://s3.amazonaws.com/beta.cdn.expertoncue.com/'+ImageService.image);
                            //$scope.$apply();
                        }
                        //$scope.links.push(myData);

                    }
                }
            });

        };
        $scope.getDevice = function (loc) {
            console.log('HELLO')
            $http.get(constants.API_URL + '/devices/location/' + loc).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    console.log(response)
                    $scope.list_devices = response;
                }
            });
        };
        $scope.getAds = function (deviceId) {

            $scope.currentDevice = deviceId;
            $scope.leftArray = [];
            $scope.rightArray = [];
            $scope.links =[];
            //$http.get('http://mystique.expertoncue.com:7272/media/' + $scope.authentication.user.username).then(function (response, err) {
            //    if (err) {
            //        console.log(err);
            //    }
            //    if (response) {
            //    }
            //});
            $http.get(constants.API_URL + '/ads/device/' + deviceId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.ads = true;
                    console.log(response);
                    for (var i in response.data) {
                        var myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName};


                        var re = /(?:\.([^.]+))?$/;

                        var ext = re.exec(myData.value)[1];
                        console.log(ext);
                        ext = ext.toLowerCase();
                        console.log(response.data)
                        if(ext =='jpg' ||ext =='png' ||ext =='svg' ) {
                            //$scope.media = 'image';
                            //self.news3image = "data:image/jpg;base64," + encode(data.Body);
                            myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'image', adId:response.data[i].adId};
                            $scope.links.push(myData);
                            //$scope.$apply();
                        }
                        else if(ext =='mp4' ||ext =='mov' || ext =='m4v') {
                            //console.log('video')
                            myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'video',  adId:response.data[i].adId};
                            //$scope.media = 'video';
                            $scope.links.push(myData);
                            //self.news3image = $sce.trustAsResourceUrl('http://s3.amazonaws.com/beta.cdn.expertoncue.com/'+ImageService.image);
                            //$scope.$apply();
                        }
                        //$scope.links.push(myData);
                        //var stuff = {value: response.data[i].mediaAsset_mediaAssetId + "-" + response.data[i].name, adId:response.data[i].adId, deviceId:response.data[i].deviceId};
                        //
                        ////$scope.links.push(myData.value.length);
                        //$scope.activeAds = true;
                        //$scope.rightArray.push(stuff);
                    }
                }
            });
        };
        $scope.activate = function(){
            console.log($scope.rightArray);
            var assets = $scope.rightArray;


        };
        $scope.sortableOptions = {
            connectWith: '.connectedItemsExample .list'
        };
        $scope.activateAd = function(adId, deviceId){
            console.log(deviceId);
            console.log(adId);
            var asset = {
                payload:{
                    adId:adId,
                    deviceId:deviceId
                }
            };
            $http.post(constants.API_URL + '/ads/', asset).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {

                    $scope.getAds(deviceId);
                }
            });
        };
        $scope.deactivateAd = function(adId, deviceId){

            $http.delete(constants.API_URL + '/ads/'+adId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.getAds(deviceId);
                    //$scope.getAds(deviceId);
                }
            });
        };
        $scope.upload = function (file) {


            var obj = {
                payload: {
                    fileName: file[0].name,
                    userName: $scope.authentication.user.username
                }
            };
            $http.post(constants.API_URL + '7272/media', obj).then(function (response, err) {
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
                    console.log(response.data)
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
                                self.determinateValue = 0;
                                $scope.init();

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
        $scope.viewFile = function (file) {
            ImageService.image = file;

            $scope.creds = {
                bucket: 'beta.cdn.expertoncue.com',
                access_key: 'AKIAICAP7UIWM4XZWVBA',
                secret_key: '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',

            };
            var params = {
                Key: ImageService.image
            };

            // Configure The S3 Object
            AWS.config.update({
                accessKeyId: $scope.creds.access_key,
                secretAccessKey: $scope.creds.secret_key
            });
            AWS.config.region = 'us-east-1';
            var bucket = new AWS.S3({params: {Bucket: $scope.creds.bucket}});
            bucket.getObject(params, function (err, data) {
                $scope.loading = true;
                if (err) {
                    // There Was An Error With Your S3 Config
                    alert(err.message);
                    return false;
                }
                else {
                    var re = /(?:\.([^.]+))?$/;

                    var ext = re.exec(ImageService.image)[1];
                    console.log(ext);
                    ext = ext.toLowerCase();
                    self.imageName = JSON.stringify(ImageService.image);
                    if(ext =='jpg' ||ext =='png' ||ext =='svg' ) {
                        $scope.media = 'image';
                        //self.news3image = "data:image/jpg;base64," + encode(data.Body);
                        $scope.$apply();
                    }
                    else if(ext =='mp4' ||ext =='mov' || ext =='wmv') {
                        $scope.media = 'video';
                        //self.news3image = $sce.trustAsResourceUrl('http://s3.amazonaws.com/beta.cdn.expertoncue.com/'+ImageService.image);
                        $scope.$apply();
                    }

                    // Success!

                }
            })
        }
    }

]);

angular.module("users.supplier").filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);
