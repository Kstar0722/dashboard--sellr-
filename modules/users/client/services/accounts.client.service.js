/* globals angular, localStorage */
angular.module('users').service('accountsService', function ($http, constants, toastr, $rootScope, $q, $analytics) {
  var me = this
  me.getAccounts = getAccounts
  me.init = function () {
    me.selectAccountId = parseInt(localStorage.getItem('accountId'), 10) || null
    me.accounts = []
    me.editAccount = {}
    me.currentAccount = {}
    me.ordersCount = 0
    bindRootProperty($rootScope, 'selectAccountId', me)
    getAccounts()
  }

  me.init()

  function getAccounts () {
    var defer = $q.defer()
    me.accounts = []
    console.log('selectAccountId %O', me.selectAccountId)
    $http.get(constants.API_URL + '/accounts?status=1').then(onGetAccountSuccess, onGetAccountError)
    function onGetAccountSuccess (res) {
      // console.log('========= res ' + JSON.stringify(res))

      me.accounts = []
      res.data.forEach(function (account) {
        if (account.preferences) {
          account.logo = account.preferences.logo || account.preferences.s3url
          account.storeImg = account.preferences.storeImg
          account.shoppr = Boolean(account.preferences.shoppr)
        }
        if (me.selectAccountId && account.accountId == me.selectAccountId) {
          me.currentAccount = account
          // intercomService.intercomActivation()
          console.log('setting current account %O', me.currentAccount)
        }
      })
      me.accounts = res.data
      defer.resolve(me.accounts)
    }

    function onGetAccountError (err) {
      toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
      console.error(err)
    }

    return defer.promise
  }

  me.deleteAccount = function (account) {
    var url = constants.API_URL + '/accounts/deactivate/' + account

    $http.put(url).then(onCreateAccountSuccess, onCreateAccountError)
    function onCreateAccountSuccess (res) {
      toastr.success('Account Deactivated!')
      console.log('accounts Service, createAccount %O', res)
      getAccounts()
    }

    function onCreateAccountError (err) {
      toastr.error('There was a problem deactivating this account')
      console.error(err)
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

      getAccounts().then(function () {
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
    me.editAccount.preferences = me.editAccount.preferences || {}
    me.editAccount.preferences.logo = me.editAccount.logo
    me.editAccount.preferences.style = me.editAccount.style
    me.editAccount.preferences.shoppr = me.editAccount.shoppr
    var payload = {
      payload: me.editAccount
    }
    console.log('about to update %O', me.editAccount)
    var url = constants.API_URL + '/accounts/' + me.editAccount.accountId
    console.log('putting to ' + url)
    $http.put(url, payload).then(onUpdateSuccess, onUpdateError)
    function onUpdateSuccess (res) {
      console.log('updated account response %O', res)
      toastr.success('Account Updated!')
    }

    function onUpdateError (err) {
      console.error('Error updating account %O', err)
      toastr.error('There was a problem updating this account')
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

  return me
})
