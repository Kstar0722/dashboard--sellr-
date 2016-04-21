'use strict';

// Configuring the Articles module
angular.module('users.editor').run(['Menus',
    function (Menus) {
        Menus.addSubMenuItem('topbar', 'editor', {
            title: 'Product Editor',
            state: 'editor.products'
        });
    }
]);
