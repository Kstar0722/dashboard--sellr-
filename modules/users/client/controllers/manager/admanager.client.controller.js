'use strict'

angular.module('users.manager').controller('AdmanagerController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'toastr', 'accountsService', 'uploadService',
  function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, toastr, accountsService, uploadService) {
    var self = this

    $scope.authentication = Authentication
    $scope.activeAds = []
    $scope.allMedia = []
    $scope.allAccountMedia = []
    $scope.sortingLog = []
    $scope.ads = false
    $scope.activeAds = false
    $scope.storeDevices = false
    $scope.toggleLeft = buildDelayedToggler('left')
    $scope.profiles = []
    $scope.myPermissions = localStorage.getItem('roles')
    $scope.accountsService = accountsService
    $scope.files = []

    accountsService.bindSelectedAccount($scope)
    $scope.$watch('selectAccountId', function (selectAccountId, prevValue) {
      if (selectAccountId == prevValue) return
      $scope.init()
    })

    function debounce (func, wait, context) {
      var timer

      return function debounced () {
        var context = $scope,
          args = Array.prototype.slice.call(arguments)
        $timeout.cancel(timer)
        timer = $timeout(function () {
          timer = undefined
          func.apply(context, args)
        }, wait || 10)
      }
    }

    function buildDelayedToggler (navID) {
      return debounce(function () {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            console.log('toggle ' + navID + ' is done')
          })
      }, 200)
    }

    $scope.youtubeLink = ''
    $scope.saveYoutubeLink = function () {
      var youTubeVideoId
      var videoId = $scope.youtubeLink.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
      if (videoId != null) {
        youTubeVideoId = videoId[1]
      } else {
        toastr.error('The video URL is invalid')
        return
      }
      uploadService.saveYoutubeVideo(youTubeVideoId, $scope.selectAccountId).then(function () {
        toastr.success('New Ad Uploaded', 'Success!')
        $scope.getAllMedia()
      }, function () {
        toastr.error('Something went wrong while trying to save the video')
      })
    }

    $scope.init = function () {
      $scope.getProfiles()
      $scope.getAllMedia()
    }

    $scope.getProfiles = function () {
      $scope.profiles = []
      $http.get(constants.API_URL + '/profiles?accountId=' + $scope.selectAccountId).then(function (res, err) {
        if (err) {
          console.log(err)
        }
        if (res.data.length > 0) {
          $scope.profiles = res.data
          $scope.currentProfile = res.data[0].profileId
          $scope.getActiveAds($scope.currentProfile)
        }
      })
    }
    $scope.getActiveAds = function (profileId) {
      $scope.activeAds = []
      $http.get(constants.API_URL + '/ads?profileId=' + profileId).then(function (response, err) {
        if (err) {
          console.log(err)
        }
        if (response.data.length > 0) {
          $scope.ads = true
          for (var i in response.data) {
            if (response.data[i].type === 'YOUTUBE') {
              myData = {
                name: 'YouTube Video',
                value: response.data[i].publicUrl,
                ext: 'youtube',
                adId: response.data[i].adId
              }
              console.log(myData)
              $scope.activeAds.push(myData)
              for (var j in $scope.allMedia) {
                if ($scope.allMedia[i].adId === myData.adId) {
                  $scope.allMedia.splice(j, 1)
                }
              }
              continue
            }

            var myData = {
              value: response.data[i].mediaAssetId + '-' + response.data[i].fileName
            }

            var re = /(?:\.([^.]+))?$/
            var ext = re.exec(myData.value)[1]
            ext = (ext || '').toLowerCase()
            if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif') {
              myData = {
                name: response.data[i].fileName,
                value: response.data[i].mediaAssetId + '-' + response.data[i].fileName,
                ext: 'image',
                adId: response.data[i].adId
              }
              for (var k in $scope.allMedia) {
                if ($scope.allMedia[i].name === myData.name) {
                  $scope.allMedia.splice(k, 1)
                }
              }
              $scope.activeAds.push(myData)
            } else if (isSupportedVideoType(ext)) {
              myData = {
                name: response.data[i].fileName,
                value: response.data[i].mediaAssetId + '-' + response.data[i].fileName,
                ext: 'video',
                adId: response.data[i].adId
              }
              for (var l in $scope.allMedia) {
                if ($scope.allMedia[i].name === myData.name) {
                  $scope.allMedia.splice(l, 1)
                }
              }
              $scope.activeAds.push(myData)
            }
          }
        }
      })
    }
    function isSupportedVideoType (ext) {
      return (ext === 'mp4' || ext === 'ogv' || ext === 'webm' || ext === 'mov' || ext === 'm4v')
    }
    $scope.getAllMedia = function () {
      $scope.allMedia = []

      $http.get(constants.API_URL + '/ads?accountId=' + $scope.selectAccountId, { timeout: 5000 }).then(function (response, err) {
        if (err) {
          console.log(err)
        }
        if (response) {
          console.log(response.data)
          for (var i in response.data) {
            if (response.data[i].type === 'YOUTUBE') {
              myData = {
                name: 'YouTube Video',
                value: response.data[i].publicUrl,
                ext: 'youtube',
                adId: response.data[i].adId
              }
              $scope.allMedia.push(myData)
              continue
            }
            var myData = {
              value: response.data[i].mediaAssetId + '-' + response.data[i].fileName
            }
            var re = /(?:\.([^.]+))?$/
            var ext = re.exec(myData.value)[1]
            ext = (ext || '').toLowerCase()
            if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif') {
              myData = {
                name: response.data[i].fileName,
                value: response.data[i].mediaAssetId + '-' + response.data[i].fileName,
                ext: 'image',
                adId: response.data[i].adId
              }
              $scope.allMedia.push(myData)
            } else if (isSupportedVideoType(ext)) {
              myData = {
                name: response.data[i].fileName,
                value: response.data[i].mediaAssetId + '-' + response.data[i].fileName,
                ext: 'video',
                adId: response.data[i].adId
              }
              $scope.allMedia.push(myData)
            }
          }
        }
      })
    }
    $scope.setCurrentProfile = function (profileId) {
      $scope.currentProfile = profileId
    }

    $scope.activateAd = function (adId, profileId) {
      var asset = {
        payload: {
          adId: adId,
          profileId: profileId
        }
      }
      $http.post(constants.API_URL + '/ads/profile', asset).then(function (response, err) {
        if (err) {
          console.log(err)
          toastr.error('Could not push ad to device. Please try again later.')
        }
        if (response) {
          $scope.getActiveAds(profileId)
          toastr.success('Ad pushed to devices!')
        }
      })
    }
    $scope.deactivateAd = function (adId, profileId) {
      console.log(adId)
      console.log(profileId)
      $http.delete(constants.API_URL + '/ads/profile?profileId=' + profileId + '&adId=' + adId).then(function (response, err) {
        if (err) {
          console.log(err)
          toastr.error('Could not remove ad from devices.')
        }
        if (response) {
          console.log(response)
          $scope.getActiveAds(profileId)
          toastr.success('Ad removed from devices.')
          $scope.getAllMedia()
        }
      })
    }
    $scope.$watch('files', function () {
      $scope.upload($scope.files)
    })
    $scope.$watch('file', function () {
      if ($scope.file != null) {
        $scope.files = [$scope.file]
      }
    })

    $scope.upload = function (files) {
      var responses = []
      for (var i = 0; i < files.length; i++) {
        var mediaConfig = {
          mediaRoute: 'ads',
          folder: 'ads',
          accountId: $scope.selectAccountId
        }
        uploadService.upload(files[i], mediaConfig).then(function (response, err) {
          if (response) {
            toastr.success('New Ad Uploaded', 'Success!')
            responses.push(response)
            if (responses.length === files.length)
              $scope.getAllMedia()
          }
        })
      }
    }

    $scope.deleteAd = function (ad) {
      console.log('delete ad %O', ad)
      var url = constants.API_URL + '/ads/' + ad.adId
      $http.delete(url).then(function () {
        toastr.success('Ad removed', 'Success')
        $scope.init()
      })
    }

    // set up two-way binding to parent property
    function bindRootProperty ($scope, name) {
      $scope.$watch('$root.' + name, function (value) {
        $scope[name] = value
      })

      $scope.$watch(name, function (value) {
        $scope.$root[name] = value
      })
    }
  }
])
