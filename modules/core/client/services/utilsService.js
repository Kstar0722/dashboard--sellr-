angular.module('core').service('utilsService', function () {
  var me = this
  me.isMatchState = function (state) {
    return state.current.name.indexOf('editor.products.match') === 0
  }

  return me
})
