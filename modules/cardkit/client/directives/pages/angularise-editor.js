(function () {
  'use strict'

  angular
        .module('cardkit.pages')
        .directive('mediumEditorModel', mediumEditorModel)

  mediumEditorModel.$inject = ['debounce', '$rootScope']

  function mediumEditorModel (debounce, $rootScope) {
    return {
      require: 'ngModel',
      restrict: 'AE',
      link: function (scope, iElement, iAttrs, ctrl) {
        var onChange = debounce(50, function () {
          ctrl.$setViewValue(iElement.html())
        })

        iElement.bind('focus', false, false)
        iElement.bind('DOMSubtreeModified', onChange)
        $rootScope.$on('updateCardHtml', onChange)
      }
    }
  }
}())
