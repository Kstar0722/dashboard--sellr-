'use strict';

angular.module('core')
  .directive('mdMenuContainerClass', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var containerClass = attrs.mdMenuContainerClass;
        attrs.$observe('mdMenuContainerClass', function (cClass) {
          containerClass = cClass;
        });

        scope.$on('$mdMenuOpen', function () {
          if (!containerClass) return;
          $('.md-open-menu-container').addClass(containerClass);
        });

        scope.$on('$mdMenuClose', function () {
          if (!containerClass) return;
          $timeout(function () {
            $('.md-open-menu-container').removeClass(containerClass);
          }, 500);
        });
      }
    }
  }]);
