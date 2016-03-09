'use strict';

// Configuring the Articles module
angular.module('users.manager').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Dashboard',
            state: 'manager.dashboard'
        });
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Ads',
            state: 'manager.ads'
        });
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Locations',
            state: 'manager.locations'
        });
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Accounts',
            state: 'manager.accounts'
        });
    }
]);
