angular.module('users').service('accountsService', function ($http, constants, toastr) {
    var me = this;


    me.init = function () {
        me.selectAccountId = localStorage.getItem('accountId');
        me.accounts = [];
        me.editAccount = {};
        me.currentAccount = {};
        getAccounts();
    };

    me.init()


    function getAccounts() {
        me.accounts = [];
        console.log('selectAccountId %O', me.selectAccountId)
        $http.get(constants.API_URL + '/accounts?status=1').then(onGetAccountSuccess, onGetAccountError);
        function onGetAccountSuccess(res) {
            me.accounts = [];
            res.data.forEach(function (account) {
                if (account.preferences != "undefined") {
                    account.logo = JSON.parse(account.preferences).s3url || JSON.parse(account.preferences).logo
                }
                if (account.accountId == me.selectAccountId) {
                    me.currentAccount = account;
                    console.log('setting current account %O', me.currentAccount)
                }
            });
            me.accounts = res.data;
        }

        function onGetAccountError(err) {
            console.error(err)
        }
    }
    me.deleteAccount = function (account) {
        var url = constants.API_URL + '/accounts/deactivate/'+account;


        $http.put(url).then(onCreateAccountSuccess, onCreateAccountError);
        function onCreateAccountSuccess(res) {
            toastr.success('Account Deactivated!');
            console.log('accounts Service, createAccount %O', res)
            getAccounts()
        }

        function onCreateAccountError(err) {
            toastr.error('There was a problem deactivating this account');
            console.error(err)
        }
    };
    me.createAccount = function (account) {
        var url = constants.API_URL + '/accounts';
        account.status = 1;
        var payload = {
            payload: account
        };
        $http.post(url, payload).then(onCreateAccountSuccess, onCreateAccountError);
        function onCreateAccountSuccess(res) {
            toastr.success('New Account Created!');
            console.log('accounts Service, createAccount %O', res)
            getAccounts()
        }

        function onCreateAccountError(err) {
            toastr.error('There was a problem creating this account');
            console.error(err)
        }
    };

    me.generateAuthCode = function (authCode) {
        var url = constants.API_URL + '/accounts/auth';
        var payload = {
            payload: {
                accountId: me.editAccount.accountId,
                authCode: authCode
            }
        };
        console.log('authCode Payload %O', payload)
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

