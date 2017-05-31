(function () {
  'use strict'

  angular
        .module('cardkit.core')
        .directive('ngAutofocus', function () {
          return {
            restrict: 'A',
            link: function (scope, element, attrs) {
              scope.$watch(attrs.ngAutofocus, function (autofocus) {
                if (autofocus || attrs.ngAutofocus == '') {
                  setTimeout(function () {
                    element[0].focus()

                    var $element = $(element)
                    if (!$element.is(':input')) {
                      var input = $element.find(':input:visible')[0] || $element.find(':input')[0]
                      if (input) input.focus()
                    }
                  }, 1)
                }
              })
            }
          }
        })
}())
