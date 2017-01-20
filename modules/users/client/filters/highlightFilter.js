/* globals angular */
angular.module('users')
  .filter('highlight', ['$sce', function ($sce) {
    return function (text, lookup) {
      if (!text || !lookup) return text;
      var lookupRegex = new RegExp('(' + _.escapeRegex(lookup) + ')', 'gi');
      var html = text.replace(lookupRegex, '<span class="highlighted">$1</span>');
      return $sce.trustAsHtml(html);
    };
  }]);
