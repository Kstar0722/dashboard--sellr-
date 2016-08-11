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
            state: 'manager.locations'
        });

        Menus.addMenuItem('main', {
            title: 'Ads',
            icon: '/img/navbar/tv_icon.svg',
            state: 'manager.ads',
            type: 'button',
            roles: [1002],
            position: 2
        });
    }
]);
