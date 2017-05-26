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

  me.stringToFirstLetterUppercase = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  me.stringToUppercaseUnderscore = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  me.handleBackMobile = function (scope) {
    scope.mobile.rightBtn = null
    var previousView = scope.mobile.backViewStack.pop()
    if (previousView) {
      // else is a desktop and do nothing
      scope.mobile.viewTitle = previousView.backTitle
      scope.mobile.view = previousView.backView
    }
    me.scrollTop()
  }

  me.setViewMobile = function (scope, newView, oldView, newTitle, oldTitle) {
    scope.mobile.viewTitle = newTitle
    scope.mobile.view = newView
    scope.mobile.backViewStack.push({backTitle: oldTitle, backView: oldView})
    me.scrollTop()
  }

  me.scrollTop = function () {
    $timeout(function () { document.body.scrollTop = document.documentElement.scrollTop = 0 })
  }

  return me
})
