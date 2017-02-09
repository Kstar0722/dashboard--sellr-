'use strict'

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: [ 1004 ],
      position: 3
    })

    Menus.addMenuItem('main', {
      title: 'Stats',
      iconFA: 'fa-bar-chart',
      state: 'dashboard',
      type: 'button',
      roles: [ 1004, 1003, 1007, 1009 ],
      position: 0
    })
  }
])
