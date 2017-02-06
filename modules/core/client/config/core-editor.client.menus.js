'use strict'

angular.module('core.editor').run([ 'Menus',
    function (Menus) {
      Menus.addMenuItem('topbar', {
        title: 'Product Editor',
        state: 'editor',
        type: 'dropdown',
        roles: [ 1010, 1011, 1004 ],
        position: 4
      })
      Menus.addMenuItem('editor', {
        title: 'Adult Beverage',
        state: 'editor.products',
        type: 'button',
        roles: [ 1010, 1011, 1004 ],
        position: 0
      })
    }
])
