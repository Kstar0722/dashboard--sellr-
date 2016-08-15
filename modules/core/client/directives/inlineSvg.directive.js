'use strict'

/*
 * Replace SVG image with inline SVG to allow CSS styling
 */
angular.module('core')
  .directive('inlineSvg', function () {
    return {
      restrict: 'AC',
      link: function (scope, element, attrs) {
        var $img = $(element);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = attrs.ngSrc || attrs.src;

        $.get(imgURL, function(data) {
          // Get the SVG tag, ignore the rest
          var $svg = $(data).find('svg');

          // Add replaced image's ID to the new SVG
          if(typeof imgID !== 'undefined') {
            $svg = $svg.attr('id', imgID);
          }
          // Add replaced image's classes to the new SVG
          if(typeof imgClass !== 'undefined') {
            $svg = $svg.attr('class', imgClass+' replaced-svg');
          }

          // Remove any invalid XML tags as per http://validator.w3.org
          $svg = $svg.removeAttr('xmlns:a');

          // Replace image with new SVG
          $img.replaceWith($svg);
        }, 'xml');
      }
    }
  });
