'use strict';

angular.module('core.storeOwner').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Store Owner',
            state: 'storeOwner',
            type: 'dropdown',
            roles: ['owner'],
            position:1
        });

    }
]);
