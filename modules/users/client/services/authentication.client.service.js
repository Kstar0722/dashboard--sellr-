'use strict'
/* global angular, localStorage, FB */
// Authentication service for user variables
angular.module('users').factory('authenticationService', ['Authentication', '$http', 'constants', '$state', 'SocketAPI', 'toastr', 'authToken', '$analytics', '$q', function (Authentication, $http, constants, $state, SocketAPI, toastr, authToken, $analytics, $q) {
  var me = this
  var auth = Authentication

  me.signin = function (credentials) {
    var url = constants.API_URL + '/users/login'
    var payload = {
      payload: credentials
    }
      // console.log(payload)
    return $http.post(url, payload).then(onSigninSuccess, onSigninError)
  }

  me.signout = function () {
    auth.user = null
    authToken.removeToken()
    localStorage.clear()
    return $state.go('home')
  }

  me.getFacebookUserData = function () {
    // var defer = $q.defer()
      // facebookConnectPlugin.login(['public_profile'],
      //      function (userAuthData) {
      //        facebookConnectPlugin.api(userAuthData.authResponse.userID + '/?fields=email,first_name,last_name', ['email', 'user_about_me'],
      //           function (facebookData) {
      //             defer.resolve(facebookData)
      //           },
      //           function (error) {
      //             defer.reject(error)
      //           })
      //      },
      //     function (error) {
      //       defer.reject(error)
      //     })

    // Facebook.getLoginStatus(function (response) {
    // })
    // Facebook.login(function (response) {
    //   console.log('FB RESPONSE', response)
    //     // Do something with response.
    // })
    FB.getLoginStatus(function (response) {
      console.log(response)
    })
    // return defer.promise
  }

  init()

  function init () {
    var user = initUser(JSON.parse(localStorage.getItem('userObject')))
    if (user) setAnalyticsUser(user)
  }

  function onSigninSuccess (response) {
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
    setAnalyticsUser(user)
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

  function setAnalyticsUser (user) {
    if (!user || !window.analytics) return

    console.log('identifying user for Analytics tracking')
    var address = user.storeAddress || {}
    analytics.identify(user.userId, {
      name: user.displayName,
      email: user.email,
      phone: user.phone || address.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.userId,
      createdAt: user.createdDate,
      city: address.city,
      state: address.state,
      address: address ? {
        street: address.address1,
        city: address.city,
        state: address.state,
        postalCode: address.zipcode,
        country: 'USA'
      } : undefined
    })
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
    return !value || value == 'undefined' || value == 'null'
  }

  return me
}
])
