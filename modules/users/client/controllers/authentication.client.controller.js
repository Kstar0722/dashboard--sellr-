'use strict'
/* globals angular,localStorage*/
angular.module('users').controller('AuthenticationController', [ '$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants', 'toastr', 'authToken', 'intercomService', 'SocketAPI',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, constants, toastr, authToken, intercomService, SocketAPI) {
    var USER_ROLE_OWNER = 1009

    $scope.reset = false
    $scope.authentication = Authentication
    $scope.popoverMsg = PasswordValidator.getPopoverMsg()
    $scope.stripeKey = constants.STRIPE_PUBLISH_KEY
    $scope.subscriptionCost = parseCost(constants.SUBSCRIPTION_PRICE)

    var userInfo = {}
    //  read userinfo from URL
    if ($location.search().r)
      userInfo = {
        accountId: Number($location.search().a),
        regCode: Number($location.search().u),
        roles: $location.search().r.split('~')
      }

    //  If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/')
    }

    $scope.acceptInvitation = function () {
      $http.get(constants.API_URL + '/users/validate/' + userInfo.regCode).then(onValidReg, onInvalidReg)
    }

    // Reg code (userId) exists in database, continue with creation
    function onValidReg (response) {
      var userUpdate = {
        payload: {
          email: $scope.credentials.email,
          firstName: $scope.credentials.firstName,
          lastName: $scope.credentials.lastName,
          username: $scope.credentials.username,
          password: $scope.credentials.password,
          roles: userInfo.roles,
          userId: userInfo.regCode,
          accountId: userInfo.accountId
        }
      }
      var url = constants.API_URL + '/users/signup/' + userInfo.regCode
      $http.put(url, userUpdate).then(onUpdateSuccess, onUpdateError)

    }

    // Reg code (userId) was invalid. Show error and reset credentials.
    function onInvalidReg (err) {
      toastr.error('User is not a valid user. Please contact support.')
      console.error(err)
      $scope.credentials = {}
    }

    // User updated users table in API successfully (registered in OnCue db) Update Mongo DB and sign in.
    function onUpdateSuccess (apiRes) {
      if (apiRes) {
        authToken.setToken(apiRes.data.token)
        // set roles
        localStorage.setItem('roles', apiRes.data.roles)
        // store account Id in location storage
        localStorage.setItem('accountId', apiRes.data.accountId)
        // set userId
        localStorage.setItem('roles', apiRes.data.roles)
        localStorage.setItem('userId', apiRes.data.userId)
        localStorage.setItem('userObject', JSON.stringify(apiRes.data))
        $scope.authentication.user = apiRes.data
        userInfo.roles.forEach(function (role) {
          $scope.authentication.user.roles.push(Number(role))
        })
        console.log($scope.authentication)
        toastr.success('Success! User Created. Logging you in now...')
        // And redirect to the previous or home page

        if ($scope.authentication.user.roles.indexOf(1002) < 0 && $scope.authentication.user.roles.indexOf(1009) < 0 && $scope.authentication.user.roles.indexOf(1004) < 0) {
          if ($scope.authentication.user.roles.indexOf(1010) >= 0) {
            $state.go('editor.products')
          }
        } else {
          $state.go('dashboard', $state.previous.params)
        }
      }
    }

    function onUpdateError (err) {
      toastr.error(err.message)
      console.error(err)
    }

    $scope.signin = function (isValid) {
      $scope.error = null
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm')
        return false
      }
      var url = constants.API_URL + "/users/login"
      var payload = {
        payload: $scope.credentials
      }
      console.log(payload)
      return $http.post(url, payload).then(onSigninSuccess, onSigninError)
    }

    function onSigninSuccess (response) {

      //  If successful we assign the response to the global user model
      authToken.setToken(response.data.token.token)
      // set roles
      localStorage.setItem('roles', response.data.roles)
      // store account Id in location storage
      localStorage.setItem('accountId', response.data.accountId)
      // set userId
      localStorage.setItem('roles', response.data.roles)
      localStorage.setItem('userId', response.data.userId)
      localStorage.setItem('userObject', JSON.stringify(response.data))
      $scope.authentication.user = response.data
      SocketAPI.connect()

      if ($scope.authentication.user.roles.indexOf(1002) < 0 && $scope.authentication.user.roles.indexOf(1009) < 0 && $scope.authentication.user.roles.indexOf(1004) < 0) {
        if ($scope.authentication.user.roles.indexOf(1010) >= 0) {
          $state.go('editor.products')
        } else if ($scope.authentication.user.roles.indexOf(1011 >= 0)) {
          $state.go('curator.store')
        }
      } else {
        $state.go('dashboard', $state.previous.params)
      }
    }

    // We could not sign into mongo, so clear everything and show error.
    function onSigninError (err) {
      console.error(err)
      toastr.error('Failed To Connect, Please Contact Support.')
      $scope.error = err.message
      $scope.credentials = {}
    }

    $scope.signup = function (isValid, user, account) {
      if ($scope.busy) return

      $scope.error = null
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'signupForm')
        return false
      }

      $scope.busy = true

      var payment = {
        stripeToken: $scope.stripeToken,
        amount: $scope.subscriptionCost.amount,
        currency: $scope.subscriptionCost.currency
      }

      var payload = angular.extend({}, user, account, payment)
      payload.roles = [ USER_ROLE_OWNER ]
      console.log(payload)

      $http.post(constants.API_URL + '/users/signup', { payload: payload }).then(function (response) {
        console.log('user signed up', response.data)
        toastr.success('You have been signed up as a store owner', 'Sign-Up Success!')
      }).catch(function (err) {
        console.log('error')
        console.error(err)
        var msg = 'There was a problem during sign up procedure'
        if ((err.data || {}).message) msg += '. ' + err.data.message
        toastr.error(msg)
        throw err
      }).then(function () {
        //  auto-signin
        $scope.credentials = user
        return $scope.signin(true).catch(function () {
          $scope.credentials = user
        })
      }).finally(function () {
        $scope.busy = false
      })
    }

    //  OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href)
      }

      //  Effectively call OAuth authentication route:
      $window.location.href = url
    }

    $scope.setPayment = function (token) {
      $scope.stripeToken = token
    }

    function parseCost (str) {
      if (!str) return
      var p = str.split(' ')
      return {
        amount: parseFloat(p[ 0 ]),
        currency: p[ 1 ] || 'USD'
      }
    }
  }
])
