'use strict';

// Configuring the Articles module
angular.module('users.curator').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'curator', {
            title: 'Assign Products',
            state: 'curator.assign'
        });
    }
]);
