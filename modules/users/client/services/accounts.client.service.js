/* globals angular, localStorage, moment */
angular.module('users').service('accountsService', function ($http, constants, toastr, $rootScope, $q, $analytics, UsStates) {
  var me = this

  me.loadAccounts = function(options) {
    me.accounts = []
    getAccounts(options).then(function(accounts) {
      me.accounts = []
      _.each(accounts, function (account) {
        if (me.selectAccountId && account.accountId == me.selectAccountId) {
          me.currentAccount = account
          // intercomService.intercomActivation()
          console.log('setting current account %O', me.currentAccount)
        }
      })
      me.accounts = accounts
    })
  }

  me.getAccounts = getAccounts;

  me.init = function (options) {
    me.selectAccountId = parseInt(localStorage.getItem('accountId'), 10) || null
    me.accounts = []
    me.editAccount = {}
    me.currentAccount = {}
    me.ordersCount = 0
    bindRootProperty($rootScope, 'selectAccountId', me)
    me.loadAccounts(options)
  }

  me.init()

  function getAccounts (options) {
    options = options || {};
    var defer = $q.defer()
    console.log('selectAccountId %O', me.selectAccountId)
    
    var url = constants.API_URL + '/accounts';
    if (options.id) url += '/' + options.id;
    url += '?status=1';
    if (options.expand) url += '&expand=' + options.expand;

    $http.get(url).then(onGetAccountSuccess, onGetAccountError)
    function onGetAccountSuccess (res) {
      // console.log('========= res ' + JSON.stringify(res))
      var accounts = _.map(res.data, initAccount)
      defer.resolve(accounts)
    }

    function onGetAccountError (err) {
      toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
      console.error(err)
    }

    return defer.promise
  }

  me.deleteAccount = function (account) {
    var accountId = account.accountId || account;
    var url = constants.API_URL + '/accounts/deactivate/' + accountId;
    var original = _.find(me.accounts, { accountId: accountId });
    return $http.put(url).then(onCreateAccountSuccess, onCreateAccountError)

    function onCreateAccountSuccess (res) {
      toastr.success('Account Deactivated!', account.storeName || account.name)
      console.log('accounts Service, createAccount %O', res)
      _.removeItem(me.accounts, original)
    }

    function onCreateAccountError (err) {
      toastr.error('There was a problem deactivating this account')
      console.error(err)
      throw err;
    }
  }

  me.createAccount = function (account) {
    var defer = $q.defer()
    var url = constants.API_URL + '/accounts'
    account.status = 1
    var payload = {
      payload: account
    }

    $http.post(url, payload).then(onCreateAccountSuccess, onCreateAccountError)

    function onCreateAccountSuccess (res) {
      toastr.success('New Account Created!')
      console.log('accounts Service, createAccount %O', res)

      $analytics.eventTrack('Account/Store Created', {
        accountId: res.data.accountId,
        storeName: res.data.name,
        storeAddress: res.data.address,
        storeCity: res.data.city,
        storeState: res.data.state,
        storePhone: res.data.phone
      });

      me.loadAccounts().then(function () {
        defer.resolve(res.data)
      })
      return res
    }

    function onCreateAccountError (err) {
      toastr.error('There was a problem creating this account')
      console.error(err)
    }

    return defer.promise
  }

  me.updateAccount = function () {
    var account = me.editAccount;
    account.preferences = account.preferences || {}
    account.preferences.logo = account.logo
    account.preferences.style = account.style
    account.preferences.shoppr = account.shoppr
    var payload = {
      payload: account
    }
    console.log('about to update %O', account)
    var url = constants.API_URL + '/accounts/' + account.accountId
    console.log('putting to ' + url)

    var original = _.find(me.accounts, { accountId: account.accountId });
    return $http.put(url, payload).then(onUpdateSuccess, onUpdateError)

    function onUpdateSuccess (res) {
      console.log('updated account response %O', res)
      return me.getAccounts({ id: original.accountId, expand: 'stores,stats' }).then(function(saved) {
        toastr.success('Account Updated!', account.storeName || account.name)
        // update existing account in collection
        _.replaceItem(me.accounts, original, _.first(saved));
      })
    }

    function onUpdateError (err) {
      console.error('Error updating account %O', err)
      toastr.error('There was a problem updating this account')
      throw err;
    }
  }

  me.generateAuthCode = function (authCode) {
    var url = constants.API_URL + '/accounts/auth'
    var payload = {
      payload: {
        accountId: me.editAccount.accountId,
        authCode: authCode
      }
    }
    console.log('authCode Payload %O', payload)
    $http.post(url, payload).then(function (res, err) {
      if (err) {
        console.error(err)
      } else {
        me.editAccount.authCode = res.data.authCode
      }
    })
  }

  me.bindSelectedAccount = function (scope) {
    bindRootProperty(scope, 'selectAccountId')
  }

  $rootScope.$watch(function () { return me.selectAccountId; }, function (accountId) {
    me.currentAccount = _.find(me.accounts, { accountId: parseInt(accountId, 10) })
  })

  // set up two-way binding to parent property
  function bindRootProperty ($scope, name, context) {
    $scope.$watch('$root.' + name, function (value) {
      (context || $scope)[ name ] = value
    })

    $scope.$watch(function () { return (context || $scope)[ name ]; }, function (value) {
      $scope.$root[ name ] = value
    })
  }

  function initAccount(account) {
    if (!account) return account;

    account.createdDateMoment = account.createdDate && moment(account.createdDate);
    account.createdDateStr = account.createdDateMoment && account.createdDateMoment.format('lll');

    if (account.state == 'un') account.state = undefined;
    var stateUpper = (account.state || '').toUpperCase();
    var state = account.state && _.find(UsStates, function(s) { return s.abbreviation == stateUpper; });
    account.stateName = state ? state.name : account.state;

    if (account.preferences) {
      account.logo = account.preferences.logo || account.preferences.s3url
      account.storeImg = account.preferences.storeImg
      account.shoppr = Boolean(account.preferences.shoppr)
    }

    return account;
  }

  return me
})
