'use strict';

// Configuring the Articles module
angular.module('users.supplier').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'supplier', {
            title: 'Upload Media',
            state: 'supplier.media'
        });
        Menus.addSubMenuItem('topbar', 'supplier', {
            title: 'View Media',
            state: 'supplier.assets'
        });

    }
]);
