'use strict';

angular.module('core.editor').run([ 'Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Product Editor',
            state: 'editor',
            type: 'dropdown',
            roles: [ 1010, 1011, 1004 ],
            position: 4
        });
        Menus.addMenuItem('editor', {
            title: 'Beer Editor',
            state: 'editor.products({type:"beer",status:"new"})',
            type: 'button',
            roles: [ 'editor', 'curator', 'admin' ],
            position: 0
        });
        Menus.addMenuItem('editor', {
            title: 'Spirits Editor',
            state: 'editor.products({type:"spirits",status:"new"})',
            type: 'button',
            roles: [ 'editor', 'curator', 'admin' ],
            position: 2
        });
        Menus.addMenuItem('editor', {
            title: 'Wine Editor',
            state: 'editor.products({type:"wine",status:"new"})',
            type: 'button',
            roles: [ 'editor', 'curator', 'admin' ],
            position: 1
        });
    }
]);
