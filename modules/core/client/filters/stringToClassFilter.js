angular.module('core')
  .filter('stringToClass', function () {
    return function (input) {
      if (typeof input !== 'string') {
        return ''
      }
      return input.trim().toLowerCase().replace(/\s/g, '-')
    }
  })
