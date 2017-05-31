(function () {
  'use strict'

  angular
        .module('cardkit.pages')
        .controller('mediaLibraryPopupController', mediaLibraryPopupController)

  mediaLibraryPopupController.$inject = ['$scope', '$mdDialog', 's3Storage', 'mimeTypeService', 'MediaAssets', 'client', 'toastr', '$timeout', 'typeFilter', 'Authentication']

  function mediaLibraryPopupController ($scope, $mdDialog, s3Storage, mimeTypeService, MediaAssets, client, toastr, $timeout, typeFilter, Authentication) {
    $scope.$mdDialog = $mdDialog
    $scope.loading = false
    $scope.typeFilter = typeFilter || ''
    $scope.showFilters = (typeFilter || '') == ''
    $scope.ui = {}
    $scope.me = Authentication.cardkit.user

    $scope.codeOf = _.codeOf

    var FileTypeMapping = {
      Photos: 'image',
      Videos: 'video',
      Audio: 'audio',
      Others: 'other'
    }

    $scope.byType = function (type) {
      if (!type) {
        return function () {
          return true
        }
      }

      if (type == 'Others' || type && type == FileTypeMapping[type]) {
        return function (item) {
          return item.fileType == FileTypeMapping.Others ||
                    !_.contains(_.values(FileTypeMapping), item.fileType)
        }
      }

      return function (item) {
        return item.fileType && (item.fileType == FileTypeMapping[type] || item.fileType == type)
      }
    }

    $scope.filterAssets = function () {
      $scope.uiAssets = _.filter($scope.assets, $scope.byType($scope.typeFilter))
      if ($scope.lazy) $scope.uiAssets = $scope.uiAssets.slice(0, 40)
    }

    $scope.selectAsset = function (asset, event) {
      $scope.ui.selectedItem = asset
      $scope.ui.confirmDelete = null
      if (event) event.stopPropagation()
    }

    $scope.removeMediaAsset = function (asset) {
      if (!asset) return

      asset.deleting = true
      $scope.selectNextAsset(asset)
      MediaAssets.delete({ assetId: asset._id }).$promise.then(function () {
        _.removeItem($scope.uiAssets, asset)
        _.removeItem($scope.assets, asset)
      }).catch(function (err) {
        asset.deleting = false
        console.error(err)
        toastr.error('Failed to remove file from media library')
      })
    }

    $scope.selectNextAsset = function (baseAsset) {
      var idx = baseAsset ? _.indexOf($scope.uiAssets, baseAsset) : -1
      var nextAsset = $scope.uiAssets[idx + 1]
      $scope.selectAsset(nextAsset)
    }

    $scope.searchAssets = function (expression) {
      $scope.ui.search = (expression || '').length >= 2 ? expression : null
      $scope.ui.selectedItem = null
      $timeout(function () {
                // trigger lazy loading for filtered images
        $('.media-library-popup [lazy-img-container]').triggerHandler('scroll')
      })
    }

    $scope.$watchCollection('assets', $scope.filterAssets)
    $scope.$watch('typeFilter', $scope.filterAssets)

    init()

    function init () {
      $scope.loading = true
      $timeout(loadAssets, 150)
    }

    function loadAssets () {
      $scope.lazy = true
      MediaAssets.getClientLibrary(null, { clientSlug: client.slug || client.companyName || client }).$promise.then(function (library) {
        $scope.assets = _.map(library, mapMediaAsset)
        if (!$scope.showFilters) {
          $scope.assets = _.filter($scope.assets, $scope.byType($scope.typeFilter))
        }
        $timeout(function () {
          $scope.lazy = false
          $scope.filterAssets()
        }, 300)
      }).catch(function (err) {
        console.error(err)
        toastr.error('Failed to load media library assets')
      }).finally(function () {
        $scope.loading = false
      })
    }

    function mapMediaAsset (item) {
      var asset = {
        _id: item._id,
        url: (item.optimized || item.original).url,
        thumbUrl: (item.thumbnail_200 || item.optimized || {}).url,
        fileName: item.filename,
        mimeType: (item.original || item.optimized || {}).mimeType,
        originalData: item
      }

      if (!asset.fileName) asset.fileName = s3Storage.filename(asset.url)
      if (!asset.mimeType) asset.mimeType = mimeTypeService.lookupType(asset.url)
      if (!asset.fileType) asset.fileType = (asset.mimeType || '').split('/')[0]
      if (!asset.thumbUrl && asset.fileType == FileTypeMapping.Photos) asset.thumbUrl = asset.url

      var fileTypes = _.values(FileTypeMapping)
      if (!_.contains(fileTypes, asset.fileType)) {
        asset.fileType = FileTypeMapping.Others
      }

      return asset
    }
  }
}())
