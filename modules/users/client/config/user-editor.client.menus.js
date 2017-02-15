'use strict'
angular.module('users.editor').run([ 'Menus', 'productEditorService',
  function (Menus, productEditorService) {
    Menus.addSubMenuItem('topbar', 'editor', {
      title: 'Store Database Management',
      state: 'curator.store',
      position: 8
    })
    Menus.addSubMenuItem('topbar', 'editor', {
      title: 'Beer Wine & Spirits',
      state: 'editor.products',
      position: 9
    })
    Menus.addSubMenuItem('topbar', 'editor', {
      title: 'Product History',
      state: 'productHistory',
      position: 10
    })
  }
])
