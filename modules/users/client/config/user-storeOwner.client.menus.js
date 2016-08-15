'use strict'

/* global angular */
angular.module('users.storeOwner').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('main', {
      title: 'Orders',
      icon: '/img/navbar/shopping_icon.svg',
      state: 'storeOwner.orders',
      type: 'button',
      roles: [1002],
      position: 1
    });
  }
])
