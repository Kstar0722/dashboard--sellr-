'use strict'

angular.module('core')
  .directive('autosizeTableBody', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var $body = angular.element(document.body);

        $timeout(function () {
          if ($body.width() < element.width()) {
            $body.css('min-width', element.width() + 'px');
          }
        });

        scope.$on('$dispose', function () {
          $body.css('min-width', 'initial');
        });
      }
    }
  });
