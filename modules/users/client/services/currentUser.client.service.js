angular.module('users').service('CurrentUserService', ['Admin',
    function (Admin) {
        var me = this;
        me.user = '';
        me.locations = '';
        Admin.query(function (data) {
            me.userList = data;
            console.log('admin returned %O', data)
        });
        return me;
    }
]);
