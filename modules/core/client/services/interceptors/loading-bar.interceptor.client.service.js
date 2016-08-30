'use strict';

angular.module('core').factory('loadingBarInterceptor', function () {
  return {
    request: function(config) {
      if (config.loadingBar) {
        config.ignoreLoadingBar = false;
      }
      if (typeof config.ignoreLoadingBar != 'boolean') {
        config.ignoreLoadingBar = true; // by default
      }
      return config;
    }
  };
});
