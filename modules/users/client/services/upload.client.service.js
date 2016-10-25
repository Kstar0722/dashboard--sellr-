/*globals angular, localStorage */
angular.module('users').service('uploadService', function ($http, constants, toastr, Authentication, $q, cfpLoadingBar) {
  var me = this

  me.init = function () {
    me.selectAccountId = localStorage.getItem('accountId')
    me.accounts = []
    me.editAccount = {}
    me.currentAccount = {}
    me.files = []
    me.determinate = { value: 0 }
  }

  me.init()

  me.upload = function (file, mediaConfig) {
    var defer = $q.defer()
    var config = mediaConfig
    if (file) {
      cfpLoadingBar.start()
      var filename = (file.name).replace(/ /g, '_')
        .replace(/[()]/g, '') // remove parentheses

      if (!file.$error) {
        var newObject
        if (config.mediaRoute === 'media') {
          if (config.type === 'PRODUCT') {
            newObject = {
              payload: {
                fileName: filename,
                userName: Authentication.user.username,
                type: config.type,
                fileType: config.fileType,
                accountId: config.accountId,
                productId: config.productId
              }
            }
          } else {
            newObject = {
              payload: {
                type: config.type,
                // fileType: config.fileType || config.type,
                fileType: config.type,
                fileName: filename,
                userName: Authentication.user.username,
                accountId: config.accountId
              }
            }
          }
        } else {
          // This is Ads media route there is no other option
          newObject = {
            payload: {
              name: config.name,
              fileName: filename,
              userName: Authentication.user.username,
              accountId: config.accountId,
              prefs: config.prefs
            }
          }
        }

        $http.post(constants.API_URL + '/' + config.mediaRoute, newObject, {
          ignoreLoadingBar: true
        }).then(function (response, err) {
          if (err) {
            console.log(err)
            cfpLoadingBar.complete()
            toastr.error('There was a problem uploading your ad.')
          }
          if (response) {
            console.log('ads response', response)
            var adId = response.data.adId
            var mediaAssetId = response.data.assetId
            var creds = {
              bucket: 'cdn.expertoncue.com/' + config.folder,
              access_key: 'AKIAICAP7UIWM4XZWVBA',
              secret_key: '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'
            }
            // Configure The S3 Object

            var params = {
              Key: response.data.assetId + '-' + filename,
              ContentType: file.type,
              Body: file,
              ServerSideEncryption: 'AES256',
              Metadata: {
                fileKey: JSON.stringify(response.data.assetId)
              }
            }
            bucketUpload(creds, params).then(function (err, res) {
              var updateMedia = {
                payload: {
                  mediaAssetId: mediaAssetId,
                  publicUrl: 'https://s3.amazonaws.com/' + creds.bucket + '/' + mediaAssetId + '-' + filename
                }
              }

              $http.put(constants.API_URL + '/media', updateMedia, {
                ignoreLoadingBar: true
              }).then(function (res2, err) {
                if (err) {
                  console.log(err)
                  cfpLoadingBar.complete()
                } else {
                  console.log('media response', res2)
                  var message = {
                    message: 'New Ad Uploaded Success!',
                    publicUrl: updateMedia.payload.publicUrl,
                    fileName: filename,
                    mediaAssetId: mediaAssetId,
                    adId: adId
                  }
                  cfpLoadingBar.complete()
                  defer.resolve(message)
                }
              })
            }, function () {
              cfpLoadingBar.complete()
            }, defer.notify)
          }
        })
      }
    }

    return defer.promise
  }

  me.saveExternalVideoAd = function (videoId, config) {
    var defer = $q.defer()
    cfpLoadingBar.start()
    var payload = {
      payload: config
    }

    $http.post(constants.API_URL + '/ads', payload, {
      ignoreLoadingBar: true
    }).then(function (response, err) {
      if (err) {
        console.log(err)
        cfpLoadingBar.complete()
        toastr.error('There was a problem saving your ad.')
      }
      if (response) {
        var mediaAssetId = response.data.assetId
        var adId = response.data.adId
        var updateMedia = {
          payload: {
            mediaAssetId: mediaAssetId,
            publicUrl: videoId
          }
        }
        $http.put(constants.API_URL + '/media', updateMedia, {
          ignoreLoadingBar: true
        }).then(function (res2, err2) {
          if (err2) {
            console.log(err2)
            cfpLoadingBar.complete()
            toastr.error('There was a problem saving your ad.')
          } else {
            var message = {
              message: 'Video Info Saved Successfully',
              videoId: updateMedia.payload.publicUrl,
              mediaAssetId: updateMedia.payload.mediaAssetId,
              adId: adId
            }
            cfpLoadingBar.complete()
            defer.resolve(message)
          }
        })
      }
    })

    return defer.promise
  }

  function bucketUpload (creds, params) {
    var defer = $q.defer()
    AWS.config.update({
      accessKeyId: creds.access_key,
      secretAccessKey: creds.secret_key
    })
    AWS.config.region = 'us-east-1'
    var bucket = new AWS.S3({
      params: {
        Bucket: creds.bucket
      }
    })

    var request = bucket.putObject(params, function (err, data) {
      me.loading = true
      if (err) {
        // There Was An Error With Your S3 Config
        alert(err.message)
        toastr.error('There was a problem uploading your ad.')
        defer.reject(false)
      } else {
        defer.resolve(data)
      }
    })

    request.on('httpUploadProgress', function (progress) {
      defer.notify(Math.round(progress.loaded / progress.total * 100))
    })

    return defer.promise
  }

  return me
})
