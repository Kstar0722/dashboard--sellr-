angular.module('users').service('CurrentUserService', ['Admin', '$state',
    function (Admin, $state) {
        var me = this;
        me.user = '';
        me.locations = '';
        me.currentUserRoles=[];
        me.userBeingEdited = {};
        me.myPermissions = localStorage.getItem('roles');
        Admin.query().then(function (data,err) {
            me.userList = data;
            console.log('admin returned %O', data)
        });
        me.update = function(){
            Admin.query(function (data) {
                me.userList = data;
                window.location.reload();
                //$state.go('admin.users',{} , {reload:true});
                //$state.go('admin.users.user-edit',{} , {reload:true})
                console.log('admin returned %O', data)
            });
        };

        return me;
    }
]);
