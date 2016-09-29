'use strict'
/* global angular, localStorage, _ */
angular.module('users.manager').controller('AdmanagerController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'toastr', 'accountsService', 'uploadService', '$q',
  function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, toastr, accountsService, uploadService, $q) {
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
      if (selectAccountId === prevValue) {
        return
      }
      $scope.init()
    })

    function debounce (func, wait, context) {
      var timer

      return function debounced () {
        var context = $scope
        var args = Array.prototype.slice.call(arguments)
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
      $scope.youtubeLink = ''
    }

    $scope.init = function () {
      $scope.getProfiles().then(function () {
        // Get Active Ads should be a getAllMedia responsibility
        $scope.getAllMedia()
      })
    }

    $scope.getProfiles = function () {
      var defer = $q.defer()
      $scope.profiles = []
      $http.get(constants.API_URL + '/profiles?accountId=' + $scope.selectAccountId).then(function (res, err) {
        if (err) {
          console.log(err)
          defer.reject()
        }
        if (res.data.length > 0) {
          $scope.profiles = res.data
          $scope.currentProfile = res.data[0].profileId
          defer.resolve()
        }
      })
      return defer.promise
    }

    $scope.getDevice = function (loc) {
      $http.get(constants.API_URL + '/devices/location/' + loc).then(function (response, err) {
        if (err) {
          console.log(err)
        }
        if (response) {
          $scope.list_devices = response
        }
      })
    }

    function isSupportedVideoType (ext) {
      return (ext === 'mp4' || ext === 'ogv' || ext === 'webm' || ext === 'mov' || ext === 'm4v')
    }

    function isSupportedImageType (ext) {
      return (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif')
    }

    function pushAdsToArray (dataArray, arrayToFill) {
      var defaultPrefs = {
        target: 'both',
        orientation: 'landscape'
      }
      for (var i = 0; i < dataArray.length; i++) {
        var myData = {
          adId: dataArray[i].adId
        }
        if (_.isEmpty(dataArray[i].preferences)) {
          myData.prefs = _.clone(defaultPrefs)
        } else {
          myData.prefs = dataArray[i].preferences
        }
        if (dataArray[i].type === 'YOUTUBE') {
          myData = _.extend(myData, {
            name: 'YouTube Video',
            value: dataArray[i].publicUrl,
            ext: 'youtube'
          })
          arrayToFill.push(myData)
          continue
        }
        myData = _.extend(myData, {
          name: dataArray[i].fileName,
          value: dataArray[i].mediaAssetId + '-' + dataArray[i].fileName
        })
        var re = /(?:\.([^.]+))?$/
        var ext = re.exec(myData.value)[1]
        ext = (ext || '').toLowerCase()
        if (isSupportedImageType(ext)) {
          arrayToFill.push(_.extend(myData, {ext: 'image'}))
        }
        if (isSupportedVideoType(ext)) {
          arrayToFill.push(_.extend(myData, {ext: 'video'}))
        }
      }
    }

    $scope.getAllMedia = function () {
      var allMedia = []

      $http.get(constants.API_URL + '/ads?accountId=' + $scope.selectAccountId).then(function (response, err) {
        if (err) {
          console.log(err)
        }
        if (response) {
          console.log('All Ads unfiltered', response.data)
          pushAdsToArray(response.data, allMedia)

          // Set Active Ads
          var activeAds = []
          $http.get(constants.API_URL + '/ads?profileId=' + $scope.currentProfile).then(function (activeAdsresponse, activeAdserr) {
            if (activeAdserr) {
              console.log(activeAdserr)
            }
            if (activeAdsresponse.data.length > 0) {
              $scope.ads = true
              pushAdsToArray(activeAdsresponse.data, activeAds)
              var activeAdsIds = _.pluck(activeAds, 'adId')
              allMedia = _.filter(allMedia, function (ad) {
                return !_.contains(activeAdsIds, ad.adId)
              })
            }
            $scope.allMedia = allMedia
            $scope.activeAds = activeAds
          })
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
          toastr.success('Ad pushed to devices!')
          $scope.getAllMedia()
        }
      })
    }

    $scope.deactivateAd = function (adId, profileId) {
      $http.delete(constants.API_URL + '/ads/profile?profileId=' + profileId + '&adId=' + adId).then(function (response, err) {
        if (err) {
          console.log(err)
          toastr.error('Could not remove ad from devices.')
        }
        if (response) {
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
          accountId: $scope.selectAccountId,
          prefs: {
            target: 'both',
            orientation: 'landscape'
          }
        }
        uploadService.upload(files[i], mediaConfig).then(function (response, err) {
          if (response) {
            toastr.success('New Ad Uploaded', 'Success!')
            responses.push(response)
            if (responses.length === files.length) {
              $scope.getAllMedia()
            }
          }
        })
      }
    }

    $scope.deleteAd = function (ad) {
      console.log('delete ad %O', ad)
      var url = constants.API_URL + '/ads/' + ad.adId
      $http.delete(url).then(function () {
        toastr.success('Ad removed', 'Success')
        $scope.getAllMedia()
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
