/* globals angular */
angular.module('users')
  .filter('highlight', ['$sce', '$sanitize', function ($sce, $sanitize) {
    return function (text, lookup) {
      if (!text || !lookup) return text;
      var lookupRegex = new RegExp('(' + _.escapeRegex(lookup) + ')', 'gi');
      var html = $sanitize(text).replace(lookupRegex, '<span class="highlighted">$1</span>');
      return $sce.trustAsHtml(html);
    };
  }]);
