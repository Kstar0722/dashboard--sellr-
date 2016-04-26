'use strict';

angular.module('core.editor').run([ 'Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Product Editor',
            state: 'editor',
            type: 'dropdown',
            roles: [ 'editor', 'curator', 'admin' ],
            position: 4
        });
    }
]);
