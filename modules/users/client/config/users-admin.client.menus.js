'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Users',
            state: 'admin.users'
        });
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Pricing',
            state: 'admin.pricing'
        });
        Menus.addSubMenuItem('topbar', 'admin', {
            title: 'Devices',
            state: 'admin.device'
        });
    }
]);
