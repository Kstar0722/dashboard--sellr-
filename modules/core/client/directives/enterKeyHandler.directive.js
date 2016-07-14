'use strict'

angular.module('core')
  .directive('enterKeyHandler', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.bind('keydown keypress keyup', function (event) {
          handleKey(event, 13, attrs.enterKeyHandler)
        })

        function handleKey (event, keyCode, handlerAttr) {
          if (event.which === keyCode) {
            scope.$apply(function () {
              scope.$eval(handlerAttr)
            })

            event.preventDefault()
          }
        }
      }
    }
  })
