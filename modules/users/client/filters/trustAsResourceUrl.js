/*globals angular */
angular.module('users')
  .filter('trustAsResourceUrl', ['$sce', function ($sce) {
    return function (val) {
      return $sce.trustAsResourceUrl(val)
    }
  }])
