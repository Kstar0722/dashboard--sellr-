/*globals angular, moment */
angular.module('users')
  .filter('hour', function () {
    return function (momentDate) {
      return moment(momentDate).format('h')
    }
  })
  .filter('time', function () {
    return function (momentDate) {
      return moment(momentDate).format('A')
    }
  })
  .filter('customDate', function () {
    return function (momentDate) {
      return moment(momentDate).format('MMMM D, YYYY h:mm A')
    }
  })
