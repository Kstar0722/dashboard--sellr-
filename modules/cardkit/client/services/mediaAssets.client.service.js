'use strict'

angular.module('cardkit.core').factory('MediaAssets', ['$resource', 'CacheFactory', 'appConfig',
  function ($resource, CacheFactory, appConfig) {
    var clientLibraryCache = CacheFactory.get('clientLibraryCache') || CacheFactory.createCache('clientLibraryCache')

    return $resource(appConfig.CARDKIT_URL + '/media-library/:assetId', {
      assetId: '@assetId',
      clientSlug: '@clientSlug'
    }, {
      getClientLibrary: {
        method: 'GET',
        url: appConfig.CARDKIT_URL + '/media-library/client/:clientSlug',
        isArray: true,
        cache: clientLibraryCache
      },
      save: {
        method: 'POST',
        url: appConfig.CARDKIT_URL + '/media-library',
        interceptor: {
          response: function (response) {
            clientLibraryCache.removeAll()
            return response.data
          }
        }
      },
      delete: {
        method: 'DELETE',
        interceptor: {
          response: function (response) {
            clientLibraryCache.removeAll()
            return response.data
          }
        }
      }
    })
  }
])
