'use strict';

angular.module('core.supplier').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'supplier',
            state: 'supplier',
            type: 'dropdown',
            roles: ['supplier']
        });

    }
]);
