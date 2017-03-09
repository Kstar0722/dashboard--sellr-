'use strict'
/* global angular, localStorage, FB */
// Authentication service for user variables
angular.module('users').factory('authenticationService', ['Authentication', '$http', 'constants', '$state', 'SocketAPI', 'toastr', 'authToken', '$analytics', '$q', function (Authentication, $http, constants, $state, SocketAPI, toastr, authToken, $analytics, $q) {
  var me = this
  var auth = Authentication

  me.signin = function (credentials, metadata) {
    var url = constants.API_URL + '/users/login'
    var payload = {
      payload: credentials
    }
    return $http.post(url, payload).then(function(response) {
      return onSigninSuccess(response, metadata)
    }, onSigninError)
  }

  me.signinFacebook = function (credentials, metadata) {
    var url = constants.API_URL + '/users/login/facebook'
    var payload = {
      payload: credentials
    }
    return $http.post(url, payload).then(function(response) {
      return onSigninSuccess(response, metadata)
    }, onSigninError)
  }

  me.signout = function () {
    auth.user = null
    authToken.removeToken()
    localStorage.clear()
    return $state.go('home')
  }

  function facebookAPIdataFetch (defer) {
    FB.api('/me', 'get', {fields: 'first_name,last_name,email'}, function (response) {
      if (!response || response.error) defer.reject(new Error('Facebook session invalid please try again'))
      defer.resolve(response)
    })
  }

  me.getFacebookUserData = function () {
    var defer = $q.defer()
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        facebookAPIdataFetch(defer)
      } else {
        FB.login(function (response) {
          if (response.authResponse) {
            facebookAPIdataFetch(defer)
          } else {
            defer.reject(new Error('User cancelled login or did not fully authorize.'))
          }
        }, {scope: 'public_profile, email'})
      }
    })
    return defer.promise
  }

  init()

  function init () {
    var user = initUser(JSON.parse(localStorage.getItem('userObject')))
    if (user) setAnalyticsUser(user)
  }

  function onSigninSuccess (response, metadata) {
    var user = initUser(response.data)

      // Check if user role is not set or if it is the only one
    if (user.accountId && user.roles.indexOf(1003) === -1 || (user.roles.indexOf(1003) > -1 && user.roles.length === 1)) {
      toastr.error('There is an error with your account permissions. Please contact support')
      return
    }

    authToken.setToken(user.token.token)
    localStorage.setItem('roles', user.roles)
    localStorage.setItem('accountId', user.accountId)
    localStorage.setItem('roles', user.roles)
    localStorage.setItem('userId', user.userId)
    localStorage.setItem('userObject', JSON.stringify(user))
    auth.user = user
    setAnalyticsUser(user, metadata)
    $analytics.eventTrack('Logged In', {
      name: user.displayName || (user.firstName + ' ' + user.lastName),
      email: user.email,
      app: 'Dashboard'
    })
    SocketAPI.connect()

      // Check if onboarding finished
    if (!user.accountId && !user.storeId) {
      $state.go('getStarted', { step: 2, password: user.password })
      return
    }

    if (auth.user.roles.indexOf(1002) < 0 && auth.user.roles.indexOf(1009) < 0 && auth.user.roles.indexOf(1004) < 0) {
      if (auth.user.roles.indexOf(1010) >= 0) {
        $state.go('editor.products')
      } else if (auth.user.roles.indexOf(1011 >= 0)) {
        $state.go('curator.store')
      }
    } else {
      $state.go('dashboard', $state.previous.params)
    }
  }

    // We could not sign into mongo, so clear everything and show error.
  function onSigninError (err) {
    console.error(err)
    if (err && err.data && err.data.message) {
      toastr.error(err.data.message)
      throw err
    } else {
      toastr.error('Failed To Connect, Please Contact Support.')
      throw Error()
    }
  }

  function setAnalyticsUser (user, metadata) {
    if (!user || !window.analytics) return
    metadata = metadata || {}

    console.log('identifying user for Analytics tracking')
    var address = user.storeAddress || {}
    address.country = address.country || 'USA'

    user.createdDate = user.createdDate || metadata.createdOn

    var traits = {
      name: user.displayName,
      email: user.email,
      phone: user.phone || address.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.userId,
      createdAt: user.createdDate,
      city: address.city,
      state: address.state,
      accountId: user.accountId,
      storeName: user.storeName,
      address: !_.isEmpty(address) ? {
        street: address.address1,
        city: address.city,
        state: address.state,
        postalCode: address.zipcode,
        country: address.country
      } : undefined,

      // ActiveCampaign specific fields
      sellrUserID: user.userId,
      sellrAccountID: user.accountId,
      organization: user.storeName,
      fullAddress: fullAddress(address, user),
      zip: address.zipcode,
      createdOn: user.createdDate,
      tags: _.compact([metadata.source])
    }

    console.log('identify traits', traits, 'for user', user)

    window.analytics.identify(user.userId, traits)
  }

  function fullAddress(address, user) {
    // EXAMPLE:
    // Bob Marley ---name
    // 1234 Green Dr. ---street address
    // Westchester, CO 80917 ---City, State Zip
    // USA ---Country

    return join('\n', [
      user.displayName || join(' ', [user.firstName, user.lastName]),
      address.address1,
      address.address2,
      join(' ', join(', ', [address.city, address.state]), address.zipcode),
      address.country
    ])

    function join(delimiter, arr) {
      return _.compact(arr).join(delimiter);
    }
  }

  function initUser (user) {
    if (!user) return

    if (isEmpty(user.displayName)) {
      user.displayName = user.firstName + ' ' + user.lastName
    } else if (isEmpty(user.firstName) && isEmpty(user.lastName)) {
      var parts = user.displayName.trim().split(' ')
      user.firstName = parts[0]
      user.lastName = parts.slice(1).join(' ').trim()
    }

    return user
  }

  function isEmpty (value) {
    return !value || value === 'undefined' || value === 'null'
  }

  return me
}
])
