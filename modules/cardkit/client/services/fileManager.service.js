(function () {
  'use strict'

  angular.module('cardkit.core').service('fileManager', fileManager)

  fileManager.$inject = ['$q', 'filepickerService', 's3Storage', 'appConfig', 'logger', 'mimeTypeService', 'MediaAssets']

  function fileManager ($q, filepickerService, s3Storage, appConfig, logger, mimeTypeService, MediaAssets) {
    if (appConfig.credentialsFilepicker) {
      filepickerService.setKey(appConfig.credentialsFilepicker.key)
    }

    var aws = appConfig.credentialsAWS

        // FilePicker services, see the full list of services at https://www.filestack.com/docs/file-ingestion/javascript-api/pick
        // var services = undefined; // automatic
    var allServices = ['COMPUTER', 'FACEBOOK', 'GOOGLE_DRIVE', 'DROPBOX', 'BOX', 'SKYDRIVE', 'INSTAGRAM', 'FLICKR', 'URL', 'GMAIL', 'WEBCAM', 'VIDEO', 'AUDIO', 'IMAGE_SEARCH']
    var imageServices = ['COMPUTER', 'FACEBOOK', 'GOOGLE_DRIVE', 'DROPBOX', 'BOX', 'SKYDRIVE', 'INSTAGRAM', 'FLICKR', 'URL', 'GMAIL', 'WEBCAM', 'IMAGE_SEARCH']
    var videoServices = ['COMPUTER', 'GOOGLE_DRIVE', 'DROPBOX', 'BOX', 'SKYDRIVE', 'URL', 'GMAIL']

    function pickAndStore (client, options) {
      var defer = $q.defer()

      defer.promise.then(function (url) {
        console.log('file uploaded', url)
        if (dialog) dialog.close()
      })

      var pickOptions = angular.extend({
                // Comment these parameters out to avoid svg=>jpeg conversion, image optimization is performed separately via TinyPNG service
                // imageQuality: 80,
                // imageMax: [2000, 2000],
        hide: false // never hide by default to enforce Crop UI on image selection, otherwise FilePicker just ignores it (kind of bug?)
      }, options)

      pickOptions.services = resolveServices(pickOptions.mimetype)

      var dialog = filepickerService.pick(pickOptions, function (blobs) {
        var blob = blobs[0] || blobs
        store(blob, client).then(defer.resolve, defer.reject, defer.notify)
      }, function (err) {
        if (err.code == 101) return defer.reject() // The user closed the dialog without picking a file
        console.error('FilePicker error', err)
        logger.error('Error uploading file')
        defer.reject(err)
      })

      return defer.promise
    }

    function store (fileOrBlob, client, options) {
      var defer = $q.defer()

      defer.promise.then(function (url) {
        console.log('file uploaded', url)
      })

      var filename = s3Storage.filename(fileOrBlob.filename || fileOrBlob.name)
      var filepath = s3Storage.resolveFolder(client) + _.safeUrl(s3Storage.salt() + '-' + filename)

      var storeOptions = angular.extend({
        location: 'S3',
        storeRegion: aws.region,
        access: 'public',
        path: filepath
      }, options)

      filepickerService.store(fileOrBlob, storeOptions, function (blobs) {
        var blob = blobs[0] || blobs
        return saveMediaAsset(blob, client).then(function (asset) {
          reportProgress(100)
          defer.resolve((asset.optimized || asset.original || asset).url)
        })
      }, function (err) {
        if (err.code == 101) return defer.reject() // The user closed the dialog without picking a file
        console.error('FilePicker error', err)
        logger.error('Error uploading file')
        defer.reject(err)
      }, function (data) {
        var progress = data.progress || data
        if (progress < 1) progress = 1
        if (progress > 99) progress = 99
        reportProgress(progress)
      })

      function reportProgress (value) {
        value = value && Math.round(value)
        defer.promise.progress = value
        defer.notify(value)
      }

      return defer.promise
    }

    function editImage (url, client, options) {
      var defer = $q.defer()
      if (url) url = url.toString()

      var mimetype = mimeTypeService.lookup(url)
      if (mimetype && !mimetype.match(/^image/i)) {
        defer.reject(mimetype + ' MimeType unsupported')
        return
      }

      var convertOptions = angular.extend({
        mimetype: 'image/*',
        services: ['CONVERT', 'COMPUTER'],
        conversions: ['crop', 'rotate', 'filter']
      }, options)

      filepickerService.processImage(url, convertOptions, function (blob) {
        var newFilename = addSuffix(s3Storage.filename(url), '-edited')
        var newKey = buildNewBlobKey(blob, client, newFilename)
        return moveTemporaryBlob(blob, newKey).then(function (blob) {
          return saveMediaAsset(blob, client).then(function (asset) {
            reportProgress(100)
            defer.resolve((asset.optimized || asset.original || asset).url)
          })
        })
      }, function (err) {
        if (err.code == 101) return defer.reject() // The user closed the dialog without saving the changes
        console.error('FilePicker error', err)
        logger.error('Error processing image')
        defer.reject(err)
      }, function (data) {
        reportProgress(data.progress)
      })

      function reportProgress (value) {
        value = value && Math.round(value)
        defer.promise.progress = value
        defer.notify(value)
      }

      return defer.promise
    }

    function optimize (blob, mimetype, width, height) {
      var key = blob.key
      mimetype = mimetype || mimeTypeService.lookup(key)
      if (/^image/.test(mimetype) && !mimetype.match(/svg+xml/)) {
        var _mb = 1024 * 1024
                // 3MB+ images are optimized additionally on client side to unload server optimization
        var clientSideOptimization = blob.size >= 3 * _mb && /^image/.test(mimetype)

        return s3Storage.optimize(blob.key, width, height, clientSideOptimization).catch(function (err) {
          console.error('failed to optimize', err)
          logger.error('Failed to optimize an image')
          throw err
        })
      } else {
        return $q.when(undefined)
      }
    }

    function saveMediaAsset (blob, client) {
      var originalUrl = resolveBlobUrl(blob)
      return optimize(blob, blob.mimetype).catch(function (err) {
        console.error('Failed to optimize file', err)
        return originalUrl // fallback, skip optimization errors and provide original asset
      }).then(function (optimizedUrl) {
        return putAssetToMediaLibrary(blob, client, optimizedUrl/*, thumbnailUrl */).catch(function (err) {
          console.warn('failed to save to media library', err)
          return { url: optimizedUrl || originalUrl } // fallback
        })
      })
    }

    function putAssetToMediaLibrary (blob, client, optimizedUrl/*, thumbnailUrl */) {
      var originalUrl = resolveBlobUrl(blob)
      if (originalUrl === optimizedUrl) optimizedUrl = undefined

      var savedAsset = MediaAssets.save({
        client: _.id(client),
        filename: blob.filename || s3Storage.filename(blob.key),
        original: originalUrl && {
          url: originalUrl,
          mimeType: blob.mimetype,
          fileSize: blob.size
        },
        optimized: optimizedUrl && {
          url: optimizedUrl,
          mimeType: mimeTypeService.lookup(optimizedUrl)
        },
        filestackUuid: blob.id
      })

      return savedAsset.$promise
    }

    function moveTemporaryBlob (blob, newKey) {
      return s3Storage.copyObject(blob.key, newKey).then(function () {
                // todo: remove old Blob following https://www.filestack.com/docs/javascript-api/remove
        var newBlob = angular.copy(blob)
        newBlob.key = newKey
        newBlob.filename = s3Storage.filename(newKey)
        return newBlob
      })
    }

    function resolveKey (url) {
      var sections = url.split('/')

            // trim domain name
      if (url.match('^http')) {
        sections.splice(0, 3)
      }

            // trim bucket name
      if (sections[0] == appConfig.credentialsAWS.bucket) {
        sections.splice(0, 1)
      }

      var key = sections.join('/')
      return key
    }

    function resolveServices (mimetype) {
      if (!mimetype) return allServices
      if (mimetype.match(/^image/i)) return imageServices
      if (mimetype.match(/^video/i)) return videoServices
      return undefined // automatic by filepicker API
    }

    function resolveBlobUrl (blob) {
      var url = aws.cdn_url + '/' + _.safeUrl(blob.key)
      return url
    }

    function buildNewBlobKey (blob, client, newFilename) {
      var newFolder = s3Storage.resolveFolder(client)
      var newFilename = s3Storage.salt() + '-' + (newFilename || s3Storage.filename(blob.key))
      var result = newFolder + _.safeUrl(newFilename)
      return result
    }

    function addSuffix (filename, suffix) {
      var parts = filename.split('.')
      parts[Math.max(0, parts.length - 2)] += suffix
      return parts.join('.')
    }

    return {
      pickAndStore: pickAndStore,
      store: store,
      editImage: editImage,
      optimize: optimize
    }
  }
})()
