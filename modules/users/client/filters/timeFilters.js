/* globals angular, moment */
angular.module('core')
.filter('hour', function () {
  return function (momentDate) {
    // NEW FORMAT USE THIS FROM NOW ON
    var momentPickup = moment(momentDate, 'MMMM D, YYYY HH')
    if (!momentPickup.isValid()) {
      // OLD FORMAT FOR BACKWARDS COMPATIBILITY ONLY
      momentPickup = moment(momentDate)
    }
    return moment(momentPickup).format('h')
  }
})
.filter('time', function () {
  return function (momentDate) {
    // NEW FORMAT USE THIS FROM NOW ON
    var momentPickup = moment(momentDate, 'MMMM D, YYYY HH')
    if (!momentPickup.isValid()) {
      // OLD FORMAT FOR BACKWARDS COMPATIBILITY ONLY
      momentPickup = moment(momentDate)
    }
    return moment(momentPickup).format('A')
  }
})
.filter('customDate', function () {
  return function (momentDate) {
    return moment(momentDate).format('MMMM D, YYYY h:mm A')
  }
})
