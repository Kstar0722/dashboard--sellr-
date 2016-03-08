angular.module('users').service('accountsService', function ($http, constants) {
    var me = this;

    me.init = function(){
        me.accounts = [];
        me.editAccount = {};
        getAccounts();
    };


    function getAccounts() {
        $http.get(constants.API_URL + '/accounts').then(onGetAccountSuccess, onGetAccountError);
        function onGetAccountSuccess(res) {
            me.accounts = res.data;
            console.log('accounts Service, accounts %O', me.accounts)
        }
        function onGetAccountError(err) {
            console.error(err)
        }
    }


    return me;

});
