angular.module('users').service('accountsService', function ($http, constants, toastr) {
    var me = this;

    me.init = function () {
        me.accounts = [];
        me.editAccount = {};
        getAccounts();
    };

    me.init()


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

    me.createAccount = function (account) {
        var url = constants.API_URL + '/accounts';
        var payload = {
            payload: account
        };
        $http.post(url, payload).then(onCreateAccountSuccess, onCreateAccountError);
        function onCreateAccountSuccess(res) {
            toastr.success('New Account Created!');
            console.log('accounts Service, createAccount %O', res)
        }

        function onCreateAccountError(err) {
            toastr.error('There was a problem creating this account');
            console.error(err)
        }
    };

    me.generateAuthCode = function (authCode) {
        var url = constants.API_URL + '/accounts/auth'
        var payload = {
            payload: {
                accountId: me.editAccount.accountId,
                oldAuthCode: authCode
            }
        };
        //TODO: wait for API route
        debugger;
        $http.post(url, payload).then(function (res, err) {
            if (err) {
                console.error(err)
            } else {
                me.editAccount.authCode = res.data.authCode;
            }
        })
    };
    return me;
});
