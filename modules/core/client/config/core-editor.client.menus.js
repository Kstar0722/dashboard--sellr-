'use strict';

angular.module('core.editor').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Editor',
            state: 'editor',
            type: 'dropdown',
            roles: ['editor']
        });

    }
]);
