/* globals angular */
angular.module('core')
  .filter('highlight', ['$sce', '$sanitize', function ($sce, $sanitize) {
    return function (text, lookup, isHtml) {
      if (!text || !lookup) return text
      var lookupRegex = new RegExp('(' + _.escapeRegex(lookup) + ')', 'gi')
      var html = (isHtml ? text : $sanitize(text)).replace(lookupRegex, '<span class="highlighted">$1</span>')
      return $sce.trustAsHtml(html)
    }
  }])
