'use strict'

// Configuring the Articles module
angular.module('users.manager').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('main', {
      title: 'Ads',
      icon: '/img/navbar/tv_icon.svg',
      state: 'manager.ads',
      type: 'button',
      roles: [1002],
      position: 2
    })
  }
])
