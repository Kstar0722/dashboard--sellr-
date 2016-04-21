'use strict';

angular.module('core.curator').run(['Menus',
    function (Menus) {
        Menus.addMenuItem('topbar', {
            title: 'Curator',
            state: 'curator',
            type: 'dropdown',
            roles: ['curator']
        });

    }
]);
