'use strict'

/* global angular */
angular.module('users.storeOwner').run(['Menus', 'accountsService',
  function (Menus, accountsService) {
    Menus.addMenuItem('main', {
      title: 'Orders',
      iconFA: 'fa-shopping-cart',
      state: 'storeOwner.orders',
      type: 'button',
      roles: [ 1002, 1004, 1009 ],
      position: 1,
      shouldRender: function () {
        var account = accountsService.currentAccount
        var preferences = account && angular.fromJson(account.preferences || null) || {}
        return preferences.shoppr
      }
    })
  }
])
