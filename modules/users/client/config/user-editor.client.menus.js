'use strict';

// Configuring the Articles module
angular.module('users.editor').run([ 'Menus', 'productEditorService',
    function (Menus, productEditorService) {
        Menus.addSubMenuItem('topbar', 'editor', {
            title: 'Wine',
            state: 'editor.products({type:"wine",status:"new"})',
            position: 9
        });
        Menus.addSubMenuItem('topbar', 'editor', {
            title: 'Beer',
            state: 'editor.products({type:"beer",status:"new"})',
            position: 9
        });
        Menus.addSubMenuItem('topbar', 'editor', {
            title: 'Spirits',
            state: 'editor.products({type:"spirits",status:"new"})',
            position: 9
        });
    }
]);
