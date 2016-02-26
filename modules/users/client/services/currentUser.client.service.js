angular.module('users').service('CurrentUserService', [
    function () {
        var me = this;
        me.user = '';
        me.locations = '';
        return me;
    }
]);
