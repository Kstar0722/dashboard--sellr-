(function () {
  'use strict'

  angular
        .module('cardkit.core')
        .directive('mdGridRelayout', mdGridRelayout)

  function mdGridRelayout () {
    return {
      restrict: 'A',
      require: '^mdGridList',
      link: function (scope, element, attrs, gridCtrl) {
        var invalidateLayout = relayout
        var interval = 0

        scope.$watch(attrs.relayoutDebounce, function (newDebounce) {
          if (interval != newDebounce) {
            interval = newDebounce
            invalidateLayout = _.debounce(relayout, interval || 0)
          }
        })

        scope.$watch(attrs.mdGridRelayout, function (relayout) {
          if (relayout) {
            invalidateLayout()
          }
        }, true)

        function relayout () {
          if (!$(element).is(':visible')) return
          gridCtrl.invalidateLayout()
        }
      }
    }
  }
}())
