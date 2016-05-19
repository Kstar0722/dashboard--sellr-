'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
      Menus.addMenuItem('topbar', {
          title: 'Admin',
          state: 'admin',
          type: 'dropdown',
          roles: [ 1004 ],
          position: 3
      });
      Menus.addMenuItem('topbar', {
          title: 'Dashboard',
          state: 'dashboard',
          type: 'button',
          roles: [ 'admin', 'manager', 'supplier', 'owner' ],
          position: 0
      });

  }
]);
