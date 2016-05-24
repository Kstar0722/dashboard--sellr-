'use strict';

angular.module('core.manager').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Manager',
            state: 'manager',
            type: 'dropdown',
            roles: [1002],
            position:0
        });

    }
]);
