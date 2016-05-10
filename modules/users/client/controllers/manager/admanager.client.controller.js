'use strict';

angular.module('users.manager').controller('AdmanagerController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'toastr', 'accountsService', 'uploadService',
    function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, toastr, accountsService, uploadService) {
        $scope.authentication = Authentication;
        var self = this;
        $scope.activeAds = [];
        $scope.allMedia = [];
        $scope.allAccountMedia = [];
        $scope.sortingLog = [];
        $scope.ads = false;
        $scope.activeAds = false;
        $scope.storeDevices = false;
        $scope.selectAccountId = localStorage.getItem('accountId');
        $scope.toggleLeft = buildDelayedToggler('left');
        $scope.profiles = [];
        $scope.myPermissions = localStorage.getItem('roles');
        $scope.accountsService = accountsService;
        $scope.files = [];

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
            $scope.getProfiles();
            $scope.getAllMedia();

        };
        $scope.getProfiles = function () {
            $scope.profiles = [];
            $http.get(constants.API_URL + '/profiles?accountId=' + $scope.selectAccountId).then(function (res, err) {
                if (err) {
                    console.log(err);
                }
                if (res.data.length > 0) {
                    $scope.profiles = res.data;
                    $scope.currentProfile = res.data[0].profileId;
                    $scope.getActiveAds($scope.currentProfile);
                }
            });
        }
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
        $scope.getActiveAds = function (profileId) {
            $scope.activeAds = [];
            $http.get(constants.API_URL + '/ads?profileId=' + profileId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response.data.length > 0) {

                    $scope.ads = true;
                    for (var i in response.data) {
                        var myData = {
                            value: response.data[i].mediaAssetId + "-" + response.data[i].fileName
                        };

                        var re = /(?:\.([^.]+))?$/;
                        var ext = re.exec(myData.value)[1];
                        ext = ext.toLowerCase();
                        if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'image',
                                adId: response.data[i].adId
                            };
                            for (var i in $scope.allMedia) {
                                if ($scope.allMedia[i].name == myData.name) {
                                    $scope.allMedia.splice(i, 1);
                                }
                            }
                            $scope.activeAds.push(myData);
                        } else if (ext == 'mp4' || ext == 'mov' || ext == 'm4v') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'video',
                                adId: response.data[i].adId
                            };
                            for (var i in $scope.allMedia) {
                                if ($scope.allMedia[i].name == myData.name) {
                                    $scope.allMedia.splice(i, 1);
                                }
                            }
                            $scope.activeAds.push(myData);
                        }

                    }
                }
            });
        };
        $scope.getAllMedia = function () {
            $scope.allMedia = [];

            $http.get(constants.API_URL + '/ads?accountId=' + $scope.selectAccountId).then(function (response, err) {
                if (err) {
                    console.log(err);
                }
                if (response) {
                    console.log(response)
                    for (var i in response.data) {
                        var myData = {
                            value: response.data[i].mediaAssetId + "-" + response.data[i].fileName
                        };
                        var re = /(?:\.([^.]+))?$/;
                        var ext = re.exec(myData.value)[1];
                        ext = ext.toLowerCase();
                        if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'image',
                                adId: response.data[i].adId
                            };
                            $scope.allMedia.push(myData);

                        } else if (ext == 'mp4' || ext == 'mov' || ext == 'm4v') {
                            myData = {
                                name: response.data[i].fileName,
                                value: response.data[i].mediaAssetId + "-" + response.data[i].fileName,
                                ext: 'video',
                                adId: response.data[i].adId
                            };
                            $scope.allMedia.push(myData);
                        }

                    }
                }
            });

        }
        $scope.setCurrentProfile = function (profileId) {
            $scope.currentProfile = profileId;
        };

        $scope.activateAd = function (adId, profileId) {
            var asset = {
                payload: {
                    adId: adId,
                    profileId: profileId
                }
            };
            $http.post(constants.API_URL + '/ads/profile', asset).then(function (response, err) {
                if (err) {
                    console.log(err);
                    toastr.error('Could not push ad to device. Please try again later.')
                }
                if (response) {
                    $scope.getActiveAds(profileId);
                    toastr.success('Ad pushed to devices!')
                }
            });
        };
        $scope.deactivateAd = function (adId, profileId) {
            console.log(adId)
            console.log(profileId)
            $http.delete(constants.API_URL + '/ads/profile?profileId=' + profileId + '&adId=' + adId).then(function (response, err) {
                if (err) {
                    console.log(err);
                    toastr.error('Could not remove ad from devices.')
                }
                if (response) {
                    console.log(response);
                    $scope.getActiveAds(profileId);
                    toastr.success('Ad removed from devices.');
                    $scope.getAllMedia();

                }
            });
        };
        $scope.$watch('files', function () {
            $scope.upload($scope.files);
        });
        $scope.$watch('file', function () {
            if ($scope.file != null) {
                $scope.files = [$scope.file];
            }
        });

        $scope.upload = function (files) {
            var responses = [];
            for (var i = 0; i < files.length; i++) {
                var mediaConfig = {
                    mediaRoute: 'ads',
                    folder: 'ads',
                    accountId: $scope.selectAccountId
                };
                uploadService.upload(files[i], mediaConfig).then(function (response, err) {
                    if (response) {
                        toastr.success('New Ad Uploaded', 'Success!');
                        responses.push(response)
                        if(responses.length == files.length)
                            $scope.getAllMedia();
                    }
                })
            }
        };

        $scope.deleteAd = function (ad) {
            console.log('delete ad %O', ad)
            var url = constants.API_URL + '/ads/' + ad.adId;
            $http.delete(url).then(function () {
                toastr.success('Ad removed', 'Success');
                $scope.init()

            })
        }

    }
]);

