angular.module('core').service('accountsService', function ($http, constants, toastr, $rootScope, $q, $analytics, UsStates, $mdDialog, $timeout) {
  var me = this

  me.loadAccounts = function (options) {
    me.accounts = []
    return getAccounts(options).then(function (accounts) {
      me.accounts = []
      _.each(accounts, function (account) {
        if (me.selectAccountId && account.accountId === me.selectAccountId) {
          me.currentAccount = account
          console.log('setting current account %O', me.currentAccount)
        }
      })
      me.accounts = accounts
      return accounts
    })
  }

  me.getAccounts = getAccounts

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
    options = options || {}
    var defer = $q.defer()
    console.log('selectAccountId %O', me.selectAccountId)

    var url = constants.API_URL + '/accounts'
    if (options.id) url += '/' + options.id
    url += '?status=1'
    if (options.expand) url += '&expand=' + options.expand

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

  me.confirmDeactivateAccount = function (account) {
    var confirm = $mdDialog.confirm()
      .title('Deactivate account?')
      .htmlContent('Are you sure you want to deactivate account <b>' + (account.storeName || account.name) + '</b>?')
      .ok('Deactivate')
      .cancel('Cancel')

    $mdDialog.cancel().then(function () {
      $timeout(function () {
        $('body > .md-dialog-container').addClass('delete confirm')
      })

      var confirmDialog = $mdDialog.show(confirm).then(function () {
        deactivateAccount(account).then(function () {
          $mdDialog.cancel(confirmDialog)
        })
      })
    })
  }

  me.confirmDeleteAccount = function (account) {
    var accountName = account.storeName || account.name

    var confirm = $mdDialog.prompt()
      .title('Delete account `' + accountName + '`?')
      .textContent('Please type the name of the account to confirm.')
      .ok('Delete')
      .cancel('Cancel')

    $mdDialog.cancel().then(function () {
      $timeout(function () {
        $('body > .md-dialog-container').addClass('delete confirm')
      })

      $mdDialog.show(confirm).then(function (code) {
        if (!code) return

        if (accountName.toUpperCase().trim() !== code.toUpperCase().trim()) {
          toastr.error('Wrong confirmation code')
          return
        }

        deleteAccountFOREVER(account)
      })
    })
  }

  me.deleteAccount = function (account) {
    var accountId = account.accountId || account
    var url = constants.API_URL + '/accounts/deactivate/' + accountId
    var original = _.find(me.accounts, { accountId: accountId })
    return $http.put(url).then(onCreateAccountSuccess, onCreateAccountError)

    function onCreateAccountSuccess (res) {
      toastr.success('Account Deactivated!', account.storeName || account.name)
      console.log('accounts Service, createAccount %O', res)
      _.removeItem(me.accounts, original)
    }

    function onCreateAccountError (err) {
      toastr.error('There was a problem deactivating this account')
      console.error(err)
      throw err
    }
  }

  me.createAccount = function (account) {
    var defer = $q.defer()
    var url = constants.API_URL + '/accounts'
    account.status = 1
    account.preferences = account.preferences || {}
    account.preferences.websiteUrl = normalizeUrl(account.preferences.websiteUrl)
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
      })

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

  me.updateAccount = function (account) {
    account.preferences = account.preferences || {}
    account.preferences.websiteUrl = normalizeUrl(account.preferences.websiteUrl)
    var payload = {
      payload: account
    }
    var url = constants.API_URL + '/accounts/' + account.accountId
    var original = _.find(me.accounts, { accountId: account.accountId })
    return $http.put(url, payload).then(onUpdateSuccess, onUpdateError)

    function onUpdateSuccess (res) {
      return me.getAccounts({ id: original.accountId, expand: 'stores,stats' }).then(function (saved) {
        saved = initAccount(_.first(saved))
        toastr.success('Account Updated!', account.name)
        _.replaceItem(me.accounts, original, saved)
      })
    }
    function onUpdateError (err) {
      console.error('Error updating account %O', err)
      toastr.error('There was a problem updating this account')
      throw err
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

  $rootScope.$watch(function () { return me.selectAccountId }, function (accountId) {
    me.currentAccount = _.find(me.accounts, { accountId: parseInt(accountId, 10) })
  })

  // set up two-way binding to parent property
  function bindRootProperty ($scope, name, context) {
    $scope.$watch('$root.' + name, function (value) {
      (context || $scope)[ name ] = value
    })

    $scope.$watch(function () { return (context || $scope)[ name ] }, function (value) {
      $scope.$root[ name ] = value
    })
  }

  function initAccount (account) {
    if (!account) return account

    account.createdDateMoment = account.createdDate && moment(account.createdDate)
    account.createdDateStr = account.createdDateMoment && account.createdDateMoment.format('Do MMM, YY')

    if (account.state === 'un') account.state = undefined
    var stateUpper = (account.state || '').toUpperCase()
    var state = account.state && _.find(UsStates, function (s) { return s.abbreviation === stateUpper })
    account.stateName = state ? state.name : account.state

    if (account.preferences) {
      account.logo = account.preferences.logo || account.preferences.s3url
      account.storeImg = account.preferences.storeImg
      account.shoppr = Boolean(account.preferences.shoppr)
      account.website = Boolean(account.preferences.website)
    }

    if (account.website) {
      account.websiteDisplayHtml = ''
      if (account.preferences.websiteUrl) {
        account.websiteDisplayHtml += '<a href="' + account.preferences.websiteUrl + '" target="_blank">' + account.preferences.websiteUrl.replace(/^http:\/\//i, '') + '</a>'
      }
      account.websiteDisplayHtml += '<br><i>Theme: ' + account.preferences.websiteTheme + '</i>'
    } else {
      account.website = false
    }

    return account
  }

  function normalizeUrl (url) {
    if (!url) return url
    if (!url.trim()) return url

    url = url.trim()

    // make sure websiteUrl starts with http
    if (!url.trim().match(/^http/i)) {
      url = 'http://' + url
    }

    return url
  }

  function deactivateAccount (account) {
    var accountId = account.accountId || account
    var url = constants.API_URL + '/accounts/deactivate/' + accountId
    var original = _.find(me.accounts, { accountId: accountId })
    return $http.put(url).then(onCreateAccountSuccess, onCreateAccountError)

    function onCreateAccountSuccess (res) {
      toastr.success('Account Deactivated!', account.storeName || account.name)
      console.log('accounts Service, createAccount %O', res)
      _.removeItem(me.accounts, original)
    }

    function onCreateAccountError (err) {
      toastr.error('There was a problem deactivating this account')
      console.error(err)
      throw err
    }
  }

  me.deleteAccountFOREVER = deleteAccountFOREVER
  function deleteAccountFOREVER (account) {
    var accountId = account.accountId || account
    var url = constants.API_URL + '/accounts/' + accountId
    var original = _.find(me.accounts, { accountId: accountId })
    return $http.delete(url).then(onDeleteAccountSuccess, onDeleteAccountError)

    function onDeleteAccountSuccess (res) {
      toastr.success('Account Deleted!', account.storeName || account.name)
      console.log('accounts Service, deleteAccount %O', res)
      _.removeItem(me.accounts, original)
    }

    function onDeleteAccountError (err) {
      toastr.error('There was a problem deleting this account')
      console.error(err)
      throw err
    }
  }

  return me
})
