'use strict'
/* global angular, _, moment */
angular.module('users.manager').controller('AdsmanagerController', ['$scope', '$state', '$http', 'Authentication', '$timeout', 'Upload', '$sce', 'ImageService', '$mdSidenav', 'constants', 'toastr', 'accountsService', 'uploadService', '$q',
  function ($scope, $state, $http, Authentication, $timeout, Upload, $sce, ImageService, $mdSidenav, constants, toastr, accountsService, uploadService, $q) {
    $scope.data = {}
    $scope.data.nameFilter = ''
    var allTimesSlots = ['0800', '0830', '0900', '0930', '1000', '1030', '1100', '1130', '1200', '1230', '1300', '1330', '1400', '1430', '1500', '1530', '1600', '1630', '1700', '1730', '1800', '1830', '1900', '1930', '2000', '2030', '2100', '2130', '2200', '2230', '2300', '2330', 'overnight']
    accountsService.bindSelectedAccount($scope)
    $scope.$watch('selectAccountId', function (selectAccountId, prevValue) {
      $scope.selectAccountId = selectAccountId
      if (selectAccountId === prevValue) {
        return
      }
      getAllAds()
    })

    function isSupportedVideoType (ext) {
      return (ext === 'mp4' || ext === 'ogv' || ext === 'webm' || ext === 'mov' || ext === 'm4v')
    }

    function isSupportedImageType (ext) {
      return (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif')
    }

    function pushAdsToArray (dataArray, arrayToFill) {
      for (var i = 0; i < dataArray.length; i++) {
        var schedule = []
        var target = ['tablet']
        if (dataArray[i].preferences) {
          schedule = dataArray[i].preferences.schedule || []
          target = dataArray[i].preferences.target || ['tablet']
        }
        var adObj = {
          id: dataArray[i].adId,
          name: dataArray[i].name || dataArray[i].fileName,
          createdDate: dataArray[i].createdDate || '',
          schedule: schedule,
          target: target,
          filename: dataArray[i].fileName
        }

        if (dataArray[i].type === 'YOUTUBE' || dataArray[i].type === 'VIMEO') {
          adObj = _.extend(adObj, {
            value: dataArray[i].publicUrl,
            type: dataArray[i].type.toLowerCase()
          })
          arrayToFill.unshift(adObj)
          continue
        }
        adObj = _.extend(adObj, {
          value: dataArray[i].mediaAssetId + '-' + dataArray[i].fileName
        })
        var ext = getFileExtension(adObj.value)
        if (isSupportedImageType(ext)) {
          arrayToFill.unshift(_.extend(adObj, {type: 'image'}))
        }
        if (isSupportedVideoType(ext)) {
          arrayToFill.unshift(_.extend(adObj, {type: 'video'}))
        }
      // else the ad is not pushed and not displayed
      }
    }

    function getFileExtension (val) {
      var re = /(?:\.([^.]+))?$/
      var ext = re.exec(val)[1]
      return (ext || '').toLowerCase()
    }

    function getAllAds () {
      var defer = $q.defer()
      var allAds = []
      var accountId = $scope.selectAccountId || $state.params.accountId
      $http.get(constants.API_URL + '/ads?accountId=' + accountId).then(function (response, err) {
        if (err) {
          console.log(err)
          $scope.allAds = []
          toastr.error('Something went wrong while retrieving ads')
          defer.reject()
        }
        if (response && response.data) {
          $scope.data.unfilteredAds = response.data
          console.log('All Ads unfiltered', response.data)
          pushAdsToArray(response.data, allAds)
          $scope.allAds = sortAds(allAds)
          console.log('UI-allAds ', allAds)
          defer.resolve()
        } else {
          $scope.allAds = []
          toastr.error('Something went wrong while retrieving ads')
          defer.reject()
        }
      })
      return defer.promise
    }

    getAllAds()
    $scope.contains = _.contains
    $scope.intersection = _.intersection
    $scope.isEmpty = _.isEmpty
    $scope.filters = ['portrait', 'landscape', 'tablet']

    function sortAds (ads) {
      ads = _.sortBy(ads, function (ad) {
        var mDate = moment(ad.createdDate)
        var i
        if (mDate.isValid()) {
          i = mDate.valueOf()
        } else {
          // This is some time in 2001
          i = 1000000000000
        }
        if (_.isEmpty(ad.schedule)) {
          // This is to simulate a negative number but large enough to cover dates til year 2200 so it wont overlap with positive numbers
          // Yes tried Number.MAX wont Work!!!
          return -10000000000000 + i
        } else {
          return i
        }
      })
      return ads.reverse()
    }

    function toggleValueFromArray (arrayTemp, value) {
      if (_.contains(arrayTemp, value)) {
        return _.without(arrayTemp, value)
      } else {
        arrayTemp.push(value)
        return arrayTemp
      }
    }

    $scope.applyFilter = function (filter) {
      $scope.filters = toggleValueFromArray($scope.filters, filter)
    }

    $scope.modifyTarget = function (adTarget) {
      $scope.modalAd.target = [adTarget]
    }

    $scope.editAd = function (ad) {
      $scope.modalAd = _.clone(ad)
      $scope.modalAd.new = false
      $scope.modalAd.noMedia = false
      $scope.openEditModal = true
    }

    $scope.newAd = function () {
      $scope.modalAd = {
        name: '',
        new: true,
        target: ['landscape'],
        noMedia: true,
        videoLink: ''
      }
      $scope.openEditModal = true
    }

    $scope.saveAd = function () {
      var ad = $scope.modalAd
      var newPrefs
      if (ad.new) {
        // NEW Ad
        if (_.isUndefined(ad.id)) {
          toastr.info('Choose a media first or cancel to close')
          return
        }
        newPrefs = {
          schedule: allTimesSlots
        }
      } else {
        // EDITING
        var oAd = _.findWhere($scope.data.unfilteredAds, {adId: ad.id})
        // if (ad.name === oAd.name && _.isEqual(ad.target, oAd.preferences.target)) {
        //   console.log('no changes')
        //   $scope.openEditModal = false
        //   return
        // }
        newPrefs = oAd.preferences
      }
      newPrefs.target = ad.target
      var payload = {
        payload: {
          name: ad.name,
          preferences: newPrefs
        }
      }
      var url = constants.API_URL + '/ads/' + ad.id
      $http.put(url, payload).then(function (res) {
        getAllAds().then(function () {
          if (ad.new) {
            toastr.success('Ad Saved', 'Success')
          } else {
            toastr.success('Ad Updated', 'Success')
          }
          $scope.openEditModal = false
        })
      })
    }

    $scope.adFilePicker = function (exts) {
      var adsConfig = {
        mediaRoute: 'ads',
        folder: 'ads',
        accountId: $scope.selectAccountId || $state.params.accountId,
        name: $scope.modalAd.name,
        prefs: {
          target: $scope.modalAd.target,
          schedule: allTimesSlots
        }
      }

      var filePickerOptions = {
        extensions: (exts || '').split(',') || undefined
      }

      uploadService.pickAndUpload(adsConfig, filePickerOptions).then(function (response) {
        if (!response) {
          return
        }
        if (response.length > 1) {
          getAllAds().then(function () {
            $scope.openEditModal = false
          })
        } else {
          var newSingleAd = response[0]
          $scope.modalAd.id = newSingleAd.adId
          $scope.modalAd.value = newSingleAd.mediaAssetId + '-' + newSingleAd.fileName
          var ext = getFileExtension($scope.modalAd.value)
          if (isSupportedImageType(ext)) {
            _.extend($scope.modalAd, {type: 'image'})
          }
          if (isSupportedVideoType(ext)) {
            _.extend($scope.modalAd, {type: 'video'})
          }
          $scope.modalAd.noMedia = false
        }
      })
    }

    $scope.cancelModal = function () {
      if ($scope.modalAd.new && !_.isUndefined($scope.modalAd.id)) {
        $scope.deleteAd($scope.modalAd.id, false)
      } else {
        $timeout(function () {
          $scope.modalAd = null
        }, 400)
        $scope.openEditModal = false
      }
    }

    function updateSchedule (ad) {
      var payload = {
        payload: {
          name: ad.name,
          preferences: {
            target: ad.target,
            schedule: ad.schedule
          }
        }
      }
      var url = constants.API_URL + '/ads/' + ad.id
      $http.put(url, payload).then(function (res) {
        $scope.allAds = sortAds($scope.allAds)
        toastr.success('Ad Schedule updated', 'Success')
      })
    }

    var lazyUpdateSchedule = _.debounce(updateSchedule, 2000)
    $scope.toggleSlot = function (ad, slot) {
      ad.schedule = toggleValueFromArray(ad.schedule, slot)
      lazyUpdateSchedule(ad)
    }

    $scope.toggleAllSlots = function (ad) {
      if (_.isEmpty(ad.schedule)) {
        ad.schedule = allTimesSlots
      } else {
        ad.schedule = []
      }
      lazyUpdateSchedule(ad)
    }

    $scope.getToggleAllSlotsClass = function (ad) {
      if (_.isEmpty(ad.schedule)) {
        return ''
      } else {
        if (ad.schedule.length === 33) {
          return 'active'
        }
        return 'semi-active'
      }
    }

    $scope.deleteAd = function (adId, showMessage) {
      var url = constants.API_URL + '/ads/' + adId
      $http.delete(url).then(function () {
        getAllAds().then(function () {
          if (showMessage) {
            toastr.success('Ad removed', 'Success')
          }
          $timeout(function () {
            $scope.modalAd = null
          }, 400)
          $scope.openEditModal = false
        })
      })
    }

    $scope.fetchVideoLink = function () {
      var videoId
      var type = ''
      var youtubeMatch = $scope.modalAd.videoLink.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)
      if (youtubeMatch != null) {
        videoId = youtubeMatch[1]
        type = 'YOUTUBE'
      } else {
        var vimeoMatch = $scope.modalAd.videoLink.match(/https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/)
        if (vimeoMatch != null) {
          videoId = vimeoMatch[3]
          type = 'VIMEO'
        } else {
          toastr.error('The video URL is invalid')
          return
        }
      }

      var accountId = $scope.selectAccountId || $state.params.accountId
      var config = {
        fileName: type,
        userName: Authentication.user.firstName + Authentication.user.lastName,
        accountId: accountId,
        name: $scope.modalAd.name,
        prefs: {
          target: $scope.modalAd.target,
          schedule: allTimesSlots
        }
      }
      uploadService.saveExternalVideoAd(videoId, config).then(function (response) {
        $scope.modalAd.id = response.adId
        $scope.modalAd.value = response.videoId
        $scope.modalAd.type = type.toLowerCase()
        $scope.modalAd.noMedia = false
      }, function () {
        toastr.error('Something went wrong while trying to save the video')
      })
    }
  }
])
