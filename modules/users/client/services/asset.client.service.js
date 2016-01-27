'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users.supplier').factory('ImageService', [
    function () {
       var me = this;
        me.image = '';

        return me;
    }
]);
