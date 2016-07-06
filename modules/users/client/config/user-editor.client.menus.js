'use strict';

// Configuring the Articles module
angular.module('users.editor').run([ 'Menus', 'productEditorService',
    function (Menus, productEditorService) {
        Menus.addSubMenuItem('topbar', 'editor', {
            title: 'Beer Wine & Spirits',
            state: 'editor.products',
            position: 9
        });
        Menus.addSubMenuItem('topbar', 'editor', {
            title: 'Search and Merge',
            state: 'merge',
            position: 9
        });
    }
]);
