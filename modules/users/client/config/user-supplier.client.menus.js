'use strict';

// Configuring the Articles module
angular.module('users.supplier').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'supplier', {
            title: 'Suppliers',
            state: 'supplier.media'
        });

    }
]);
