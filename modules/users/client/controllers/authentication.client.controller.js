'use strict'
/* globals angular,localStorage */
angular.module('users').controller('AuthenticationController', [ '$scope', '$state', '$stateParams', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants', 'toastr', 'authToken', 'authenticationService',
  function ($scope, $state, $stateParams, $http, $location, $window, Authentication, PasswordValidator, constants, toastr, authToken, authenticationService) {
    var USER_ROLE_OWNER = 1009

    $scope.reset = false
    $scope.authentication = Authentication
    $scope.popoverMsg = PasswordValidator.getPopoverMsg()
    $scope.credentials = {};
    $scope.credentials.email = $stateParams.email;

    var userInfo = {}
    //  read userinfo from URL
    if ($location.search().r) {
      userInfo = {
        accountId: Number($location.search().a),
        regCode: Number($location.search().u),
        roles: $location.search().r.split('~')
      }
    }

    //  If user is signed in then redirect back home
    if ($state.is('home') && $scope.authentication.user && !$state.is('authentication.reset')) {
      $location.path('/')
    }

    $scope.needHelp = function () {
      $scope.reset = !$scope.reset
      window._gs('chat', 'show')
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

      authenticationService.signin($scope.credentials).catch(function (err) {
        if (err && err.data && err.data.message) {
          $scope.error = err.data.message
        }
        $scope.credentials.password = null
        $scope.$broadcast('show-errors-reset', 'userForm')
      });
    }

    $scope.signup = function (isValid, user, account) {
      if ($scope.busy) return

      $scope.error = null
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'signupForm')
        return false
      }

      $scope.busy = true

      var payload = angular.extend({}, user, account)
      payload.source = 'dashboard'
      payload.roles = [ USER_ROLE_OWNER ]
      // console.log(payload)

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
  }
])
