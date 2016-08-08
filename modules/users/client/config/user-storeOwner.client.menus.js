'use strict'

/* global angular */
angular.module('users.storeOwner').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'storeOwner', {
      title: 'Invite User',
      state: 'storeOwner.inviteUser',
      position: 8
    })
    Menus.addSubMenuItem('topbar', 'storeOwner', {
      title: 'Orders',
      state: 'storeOwner.orders',
      position: 0
    })
  }
])
