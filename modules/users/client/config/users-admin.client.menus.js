'use strict'
/* globals angular*/
// Configuring the Articles module
angular.module('users.admin').run([ 'Menus',
  function (Menus, ord) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Account Manager',
      state: 'admin.accounts',
      position: 3
    })
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'User Management',
      state: 'admin.users',
      position: 5
    });
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Invite User',
      state: 'storeOwner.inviteUser',
      position: 6
    });
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Pricing Calculator',
      state: 'admin.pricing',
      position: 7
    })
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Stores Manager',
      state: 'manager.stores',
      position: 10
    });
  }
])
