angular.module('users').service('CurrentUserService', [
    function () {
        console.log('current user server... hi guys')
        var me = this;
        me.user = '';
        me.locations = '';
        return me;
    }
]);
