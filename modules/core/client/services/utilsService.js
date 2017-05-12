angular.module('core').service('utilsService', function ($timeout) {
  var me = this
  me.isMatchState = function (state) {
    return state.current.name.indexOf('editor.products.match') === 0
  }

  me.getDebouncedFuntion = function (fn) {
    return _.debounce(fn, 3000)
  }

  me.setAutosaveMessage = function (scope) {
    scope.ui.autosaved = true
    $timeout(function () { scope.ui.autosaved = false }, 3000)
  }

  return me
})
