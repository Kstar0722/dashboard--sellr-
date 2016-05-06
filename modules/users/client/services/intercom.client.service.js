angular.module('users').service('intercomService', function ($http, constants, toastr, Authentication, $q) {
    var me = this;

    console.log('intercom service called!')
    me.intercomActivation = function () {
        window.Intercom('boot', {
            app_id: 'ugnow3fn',
            name: Authentication.user.username,
            email: Authentication.user.email,
            created_at: Authentication.user.created,
            widget: {
                activator: '#IntercomDefaultWidget'
            }
        });
    };





    return me;
});

