'use strict';

angular.module('cardkit.core').factory('MediaAssets', ['$resource', 'CacheFactory',
    function($resource, CacheFactory) {
        var clientLibraryCache = CacheFactory.get('clientLibraryCache') || CacheFactory.createCache('clientLibraryCache');

        return $resource('/media-library/:assetId', {
            assetId: '@assetId',
            clientSlug: '@clientSlug'
        }, {
            getClientLibrary: {
                method: 'GET',
                url: '/media-library/client/:clientSlug',
                isArray: true,
                cache: clientLibraryCache
            },
            save: {
                method: 'POST',
                url: '/media-library',
                interceptor: {
                    response: function(response) {
                        clientLibraryCache.removeAll();
                        return response.data;
                    }
                }
            },
            delete: {
                method: 'DELETE',
                interceptor: {
                    response: function(response) {
                        clientLibraryCache.removeAll();
                        return response.data;
                    }
                }
            }
        });
    }
]);
