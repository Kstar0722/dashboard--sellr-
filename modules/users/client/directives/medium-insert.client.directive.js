'use strict'

angular.module('core').directive('mediumInsert', function ($location, $timeout) {
  var IFRAMELY_API_KEY = '2d78c263b01d3413bf50d3' // logistics@getsellr.com account

  return {
    require: 'ngModel',
    restrict: 'A',
    link: function (scope, iElement, iAttrs, ngModel) {
      var $mediumInsertCompatible = iElement.filter(withoutLinksInHierarchy)
      if ($mediumInsertCompatible.length === 0) return

      var embedproxyurl = $location.protocol() + '://iframe.ly/api/oembed?iframe=1&api_key=' + IFRAMELY_API_KEY
      iElement.not($mediumInsertCompatible).data('plugin_mediumInsert', {
        disable: $.noop
      })

      ngModel.$parsers.push(function (html) {
        var $tmp = $('<div>').html(html || '')
        $tmp.find('.medium-insert-buttons').remove()
        $tmp.find('.image.uploading').remove()
        $tmp.find('.image > img').unwrap()
        $tmp.find('.medium-insert-active').removeClass('medium-insert-active')
        return $tmp.html()
      })

      $timeout(function () {
        $mediumInsertCompatible.mediumInsert({
          editor: ngModel.editor,
          addons: {
            embeds: {
              placeholder: 'Paste a link and press Enter',
              oembedProxy: embedproxyurl
            }
          }
        })
      })

      function withoutLinksInHierarchy (element) {
        var $e = $(element)
        return !$e.is('a') && $e.closest('a').length === 0 && $e.find('a').length === 0
      }
    }
  }
})
