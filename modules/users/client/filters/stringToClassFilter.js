/* globals angular */
angular.module('users')
  .filter('stringToClass', function () {
    return function (input) {
      if (typeof input !== 'string') {
        return ''
      }
      return input.trim().toLowerCase().replace(/\s/g, '-')
    }
  })
