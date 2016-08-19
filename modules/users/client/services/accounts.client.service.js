/* globals angular, localStorage */
angular.module('users').service('accountsService', function ($http, constants, toastr, intercomService) {
  var me = this
  me.init = function () {
    me.selectAccountId = localStorage.getItem('accountId')
    me.accounts = []
    me.editAccount = {}
    me.currentAccount = {}
    me.ordersCount = 0
    getAccounts()
  }

  me.init()

  function getAccounts () {
    me.accounts = []
    console.log('selectAccountId %O', me.selectAccountId)
    $http.get(constants.API_URL + '/accounts?status=1').then(onGetAccountSuccess, onGetAccountError)
    function onGetAccountSuccess (res) {
      me.accounts = []
      res.data.forEach(function (account) {
        if (account.preferences !== 'undefined') {
          account.logo = JSON.parse(account.preferences).s3url || JSON.parse(account.preferences).logo
          account.storeImg = JSON.parse(account.preferences).storeImg
          account.shoppr = Boolean(JSON.parse(account.preferences).shoppr)
        }
        if (account.accountId === me.selectAccountId) {
          me.currentAccount = account
          intercomService.intercomActivation()
          console.log('setting current account %O', me.currentAccount)
        }
      })
      me.accounts = res.data
    }

    function onGetAccountError (err) {
      toastr.error("We're experiencing some technical difficulties with our database, please check back soon")
      console.error(err)
    }
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
    var url = constants.API_URL + '/accounts'
    account.status = 1
    var payload = {
      payload: account
    }
    $http.post(url, payload).then(onCreateAccountSuccess, onCreateAccountError)
    function onCreateAccountSuccess (res) {
      toastr.success('New Account Created!')
      console.log('accounts Service, createAccount %O', res)
      getAccounts()
    }

    function onCreateAccountError (err) {
      toastr.error('There was a problem creating this account')
      console.error(err)
    }
  }

  me.updateAccount = function () {
    me.editAccount.preferences = {
      logo: me.editAccount.logo,
      storeImg: me.editAccount.storeImg,
      style: me.editAccount.style,
      shoppr: me.editAccount.shoppr
    }
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

  // set up two-way binding to parent property
  function bindRootProperty ($scope, name) {
    $scope.$watch('$root.' + name, function (value) {
      $scope[name] = value
    })

    $scope.$watch(name, function (value) {
      $scope.$root[name] = value
    })
  }

  return me
})
