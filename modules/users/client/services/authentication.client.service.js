'use strict'
/* global angular, _gs, localStorage */
// Authentication service for user variables
angular.module('users').factory('authenticationService', ['Authentication', '$http', 'constants', '$state', 'SocketAPI', 'toastr', 'authToken', '$analytics',
  function (Authentication, $http, constants, $state, SocketAPI, toastr, authToken, $analytics) {
    var me = this;
    var auth = Authentication;

    me.signin = function (credentials) {
      var url = constants.API_URL + '/users/login'
      var payload = {
        payload: credentials
      }
      // console.log(payload)
      return $http.post(url, payload).then(onSigninSuccess, onSigninError)
    };

    me.signout = function () {
      auth.user = null;
      authToken.removeToken();
      localStorage.clear();
      return $state.go('home');
    };

    me.setAnalyticsUser = function (user) {
      if (!user || !window.analytics) return;
      console.log('identifying user for Analytics tracking')
      analytics.identify(user.userId, {
        name: user.displayName || (user.firstName + ' ' + user.lastName),
        email: user.email,
        accountId: user.accountId
      });
    };

    init();

    function init() {
      var user = JSON.parse(localStorage.getItem('userObject'))
      if (user) me.setAnalyticsUser(user);
    }

    function onSigninSuccess (response) {
      var user = response.data;

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
      me.setAnalyticsUser(user);
      $analytics.eventTrack('Logged In', {
        name: user.displayName || (user.firstName + ' ' + user.lastName),
        email: user.email,
        app: 'Dashboard'
      })
      SocketAPI.connect()

      // Check if onboarding finished
      if (!user.accountId && !user.storeId) {
        $state.go('getStarted', { step: 2, password: user.password });
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
        throw err;
      } else {
        toastr.error('Failed To Connect, Please Contact Support.')
        throw Error();
      }
    }

    return me
  }
])
