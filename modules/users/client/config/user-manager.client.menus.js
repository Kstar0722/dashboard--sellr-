'use strict';

// Configuring the Articles module
angular.module('users.manager').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Manage Ads',
            state: 'manager.ads'
        });
        Menus.addSubMenuItem('topbar', 'manager', {
            title: 'Upload Ads',
            state: 'manager.uploads'
        });


    }
]);
