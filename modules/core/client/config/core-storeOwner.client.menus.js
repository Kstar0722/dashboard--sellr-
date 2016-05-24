'use strict';

angular.module('core.storeOwner').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Store Owner',
            state: 'storeOwner',
            type: 'dropdown',
            roles: [1009],
            position:1
        });

    }
]);
