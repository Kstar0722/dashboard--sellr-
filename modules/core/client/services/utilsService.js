angular.module('core').service('utilsService', function ($timeout) {
  var me = this
  me.isMatchState = function (state) {
    return state.current.name.indexOf('editor.products.match') === 0
  }

  me.getDebouncedFuntion = function (fn) {
    return _.debounce(fn, 3000)
  }

  me.setAutosaveMessage = function (scope) {
    scope.ui = scope.ui || {}
    scope.ui.autosaved = true
    $timeout(function () { scope.ui.autosaved = false }, 3000)
  }

  me.setCancelAutosave = function (scope) {
    // 4secs Grace period to allow switching object for edit then when autosave function triggers in 3 seconds it will not save. Only after 4sec it will autosave
    scope.ui = scope.ui || {}
    scope.ui.cancelAutosave = true
    $timeout(function () { scope.ui.cancelAutosave = false }, 4000)
  }

  return me
})
