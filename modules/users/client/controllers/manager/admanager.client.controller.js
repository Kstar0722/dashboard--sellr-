'use strict';

angular.module('users.manager').controller('AdmanagerController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav','constants',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav,constants) {
        $scope.authentication = Authentication;
        var self = this;
        $scope.links = [];
        $scope.sources = [];
        $scope.sortingLog = [];
        $scope.ads = false;
        $scope.activeAds = false;
        $scope.storeDevices = false;
        $scope.toggleLeft = buildDelayedToggler('left');
        $scope.profiles=[];
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
            $http.get(constants.API_URL  +'/profiles?userName=' + "'"+ $scope.authentication.user.username + "'").then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    for(var i in res.data)
                        $scope.profiles.push({profileName:res.data[i].name, profileId:res.data[i].profileId});
                    $scope.currentProfile = res.data[0].profileId;
                    $scope.getAds($scope.currentProfile);
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
                            myData = {name:response.data[i].fileName,value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'image', adId:response.data[i].adId};
                            $scope.sources.push(myData);
                        }
                        else if(ext =='mp4' ||ext =='mov' || ext =='m4v') {
                            myData = {name:response.data[i].fileName,value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'video', adId:response.data[i].adId};
                            $scope.sources.push(myData);
                        }

                    }
                }
            });

        };
        $scope.getDevice = function (loc) {
            $http.get(constants.API_URL + '/devices/location/' + loc).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {

                    $scope.list_devices = response;
                }
            });
        };
        $scope.getAds = function (profileId) {

            $scope.links =[];
            $http.get(constants.API_URL + '/ads?profileId=' + profileId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    $scope.ads = true;
                    for (var i in response.data) {
                        var myData = {value: response.data[i].mediaAssetId + "-" + response.data[i].fileName};

                        var re = /(?:\.([^.]+))?$/;
                        var ext = re.exec(myData.value)[1];
                        ext = ext.toLowerCase();
                        if(ext =='jpg' ||ext =='png' ||ext =='svg' ) {
                            myData = {name:response.data[i].fileName,value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'image', adId:response.data[i].adId};
                            $scope.links.push(myData);
                        }
                        else if(ext =='mp4' ||ext =='mov' || ext =='m4v') {
                            myData = {name:response.data[i].fileName, value: response.data[i].mediaAssetId + "-" + response.data[i].fileName, ext:'video',  adId:response.data[i].adId};
                            $scope.links.push(myData);
                        }

                    }
                }
            });
        };
        $scope.setCurrentProfile = function(profileId){
            $scope.currentProfile = profileId;
        };

        $scope.activateAd = function(adId, profileId){

            var asset = {
                payload:{
                    adId:adId,
                    profileId:profileId
                }
            };
            $http.post(constants.API_URL + '/ads/profile', asset).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {

                    $scope.getAds(profileId);
                }
            });
        };
        $scope.deactivateAd = function(adId, profileId){
                console.log(adId)
            console.log(profileId)
            $http.delete(constants.API_URL + '/ads/profile?profileId='+profileId+'&adId='+adId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    console.log(response);
                    $scope.getAds(profileId);
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
                        });
                }
                else {
                    // No File Selected
                    alert('No File Selected');
                }
            });
        };
    }
]);

angular.module("users.supplier").filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);
