'use strict';

// Configuring the Articles module
angular.module('users.manager').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Ad Manager',
            state: 'manager.ads'
        });
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Location Manager',
            state: 'manager.location'
        });

    }
]);