'use strict'

// Configuring the Articles module
angular.module('users.supplier').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Supplier',
      state: 'supplier.media',
      type: 'button',
      roles: [1007],
      position: 2
    })
  }
])
