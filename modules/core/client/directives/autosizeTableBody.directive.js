'use strict'

angular.module('core')
  .directive('autosizeTableBody', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var $body = angular.element(document.body);

        enable(true);
        scope.$watch(attrs.autosizeTableBody, function (value) {
          enable(value);
        });

        scope.$watch('showSkippedColumns', function () {
          enable(true);
        }, true);

        scope.$on('$dispose', function () {
          enable(false);
        });

        function enable(value) {
          if (value === false) {
            $body.css('min-width', 'initial');
            return;
          }

          $timeout(function () {
            var width = $body.width() < element.width() ? element.width() + 'px' : 'initial';
            $body.css('min-width', width);
          });
        }
      }
    }
  });
