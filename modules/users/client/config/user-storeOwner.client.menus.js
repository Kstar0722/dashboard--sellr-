'use strict';

// Configuring the Articles module
angular.module('users.storeOwner').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'storeOwner', {
            title: 'Invite User',
            state: 'storeOwner.inviteUser'
        });

    }
]);
