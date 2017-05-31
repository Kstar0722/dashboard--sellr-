'use strict'

angular
    .module('cardkit.core')
    .directive('formNested', function () {
      return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<form ng-transclude></form>',
        link: function (scope, element) {
          element.removeClass('ng-hide')
        }
      }
    })
