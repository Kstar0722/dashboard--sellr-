/*globals angular, localStorage */
angular.module('users').service('uploadService', function ($http, constants, toastr, Authentication, $q, cfpLoadingBar, filepickerService) {
  var me = this

  filepickerService.setKey(constants.FILEPICKER_KEY);

  var aws = {
    bucket: constants.AWS_S3_BUCKET,
    region: constants.AWS_S3_REGION,
    access_key: constants.AWS_ACCESS_KEY,
    secret_key: constants.AWS_SECRET_KEY
  };

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

    if (!file || file.$error) {
      return $q.reject();
    }

    cfpLoadingBar.start();

    createMedia(mediaConfig, file).then(function (media) {
      var key = mediaConfig.folder + '/' + media.assetId + '-' + media.fileName;
      var metadata = {
        fileKey: JSON.stringify(media.assetId)
      };

      return bucketUpload(key, file, metadata)
        .then(null, null, defer.notify) // report uploading progress
        .then(function(publicUrl) {
          return updateMedia(media, publicUrl);
        });

    }).catch(function (err) {
      console.log(err);
      toastr.error('There was a problem uploading your ad.');
    }).finally(function () {
      cfpLoadingBar.complete();
    });

    return defer.promise
  };

  me.pickAndUpload = function (mediaConfig, options) {
    var defer = $q.defer();

    pickFile(options).then(function (blob) {
      cfpLoadingBar.start();

      return createMedia(mediaConfig, { name: blob.filename }).then(function (media) {
        return storeFile(blob, { path: mediaConfig.folder + '/' + media.assetId + '-' + media.fileName })
          .then(null, null, defer.notify) // report uploading progress
          .then(function (url) {
            return updateMedia(media, url);
          });
      }).catch(function (err) {
        console.log(err);
        toastr.error('There was a problem uploading your ad.');
      }).finally(function () {
        cfpLoadingBar.complete();
      });
    }).then(defer.resolve, defer.reject);

    return defer.promise;
  };

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

  function bucketUpload(key, file, metadata) {
    var defer = $q.defer()

    // Configure The S3 Object
    var params = {
      Key: key,
      ContentType: file.type,
      Body: file,
      ServerSideEncryption: 'AES256',
      Metadata: metadata
    };

    AWS.config.update({
      accessKeyId: aws.access_key,
      secretAccessKey: aws.secret_key
    })
    AWS.config.region = aws.region
    var bucket = new AWS.S3({
      params: {
        Bucket: aws.bucket
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
        var publicUrl = 'https://s3.amazonaws.com/' + aws.bucket + '/' + key;
        defer.resolve(publicUrl)
      }
    })

    request.on('httpUploadProgress', function (progress) {
      defer.notify(Math.round(progress.loaded / progress.total * 100))
    })

    return defer.promise
  }

  function createMedia(config, file) {
    var filename = (file.name).replace(/ /g, '_')
      .replace(/[()]/g, '') // remove parentheses

    var payload;
    if (config.mediaRoute === 'media') {
      if (config.type === 'PRODUCT') {
        payload = {
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
        payload = {
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
      payload = {
        payload: {
          name: config.name,
          fileName: filename,
          userName: Authentication.user.username,
          accountId: config.accountId,
          prefs: config.prefs
        }
      }
    }

    return $http.post(constants.API_URL + '/' + config.mediaRoute, payload, {
      ignoreLoadingBar: true
    }).then(function (response, err) {
      if (err) throw err;

      console.log('ads response', response);
      if (!response || !response.data) throw Error('media not created');

      var media = response.data;
      media.fileName = media.fileName || filename;
      return media;
    });
  }

  function updateMedia(media, publicUrl) {
    var payload = {
      payload: {
        mediaAssetId: media.assetId,
        publicUrl: publicUrl
      }
    };

    return $http.put(constants.API_URL + '/media', payload, {
      ignoreLoadingBar: true
    }).then(function (res, err) {
      if (err) throw err;
      console.log('media response', res)

      var result = {
        message: 'New Ad Uploaded Success!',
        publicUrl: publicUrl,
        fileName: media.fileName,
        mediaAssetId: media.assetId,
        adId: media.adId
      }

      return result;
    })
  }

  function pickFile(options) {
    var defer = $q.defer();

    var pickOptions = angular.extend({
      imageQuality: 80,
      imageMax: [2000, 2000],
      conversions: ['crop', 'rotate', 'filter'],
      hide: false // never hide by default to enforce Crop UI on image selection, otherwise FilePicker just ignores it (kind of bug?)
    }, options);

    filepickerService.pick(pickOptions, function(blobs) {
      var blob = blobs[0] || blobs;
      defer.resolve(blob);
    }, function(err) {
      if (err.code == 101) return defer.reject(); // The user closed the dialog without picking a file
      console.error('FilePicker error', err);
      toastr.error('There was a problem selecting a file for upload.');
      defer.reject(err);
    }, function (data) {
      defer.notify(data.progress);
    });

    return defer.promise;
  }

  function storeFile(blob, options) {
    var defer = $q.defer();

    var storeOptions = angular.extend({
      location: 'S3',
      access: 'public'
    }, options);

    filepickerService.store(blob, storeOptions, function (blob) {
      var url = 'https://s3.amazonaws.com/' + constants.AWS_S3_BUCKET + '/' + blob.key;
      defer.resolve(url);
    }, function (err) {
      if (err.code == 101) return defer.reject(); // The user closed the dialog without picking a file
      console.error('FilePicker error', err);
      toastr.error('There was a problem uploading your ad.');
      defer.reject(err);
    }, function (data) {
      defer.notify(data.progress);
    });

    return defer.promise;
  }

  return me
})
