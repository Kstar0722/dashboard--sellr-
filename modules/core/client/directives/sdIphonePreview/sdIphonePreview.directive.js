'use strict';

angular.module('core')
  .directive('sdIphonePreview', [function () {
    return {
      restrict: 'E',
      template: '<div></div>',
      scope: {
        url: '=',
        scale: '='
      },
      link: function (scope, element, attrs) {
        scope.$watch('url', iphonePreview);
        scope.$watch('scale', iphonePreview);

        function iphonePreview() {
          element.empty();
          if (!scope.url) return;
          bioMp(element[0], {
            url: scope.url,
            scale: scope.scale,
            view: 'front',
            image: '/modules/core/client/directives/sdIphonePreview/iphone6_front_gold.png'
          });
        }
      }
    };
  }]);
