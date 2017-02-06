'use strict'

angular.module('core')
  .directive('sdPopup', function () {
    return {
      templateUrl: '/modules/core/client/directives/sdPopup/sdPopup.directive.html',
      scope: {
        visible: '='
      },
      replace: true,
      transclude: true,
      link: function (scope, element, attrs) {
        element.on('click', function (e) {
          e.stopPropagation()
        })
      }
    }
  })
