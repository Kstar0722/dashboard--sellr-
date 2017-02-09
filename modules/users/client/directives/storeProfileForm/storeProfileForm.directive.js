/* globals angular, moment */

'use strict'
angular.module('core')
  .directive('storeProfileForm', function (UsStates) {
    var DEFAULT_OPEN_TIME = '09:00'
    var DEFAULT_CLOSE_TIME = '17:00'

    return {
      restrict: 'E',
      templateUrl: '/modules/users/client/directives/storeProfileForm/storeProfileForm.html',
      scope: {
        account: '=',
        store: '=',
        form: '='
      },
      link: function (scope, element, attrs) {
        scope.states = UsStates
        scope.form = scope.storeForm
        scope.$scope = scope

        scope.updateTimes = function (day) {
          if (day.open) {
            day.openTime = parseTime(DEFAULT_OPEN_TIME)
            day.closeTime = parseTime(DEFAULT_CLOSE_TIME)
          } else {
            day.openTime = null
            day.closeTime = null
          }
        }

        function parseTime (value) {
          var start = moment(0)
          start = start.add(-start.utcOffset(), 'minutes').toDate() // trim utc offset
          var time = moment(start).add(moment.duration(value)).toDate()
          return time
        }
      }
    }
  })
