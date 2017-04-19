'use strict'
/* globals angular,localStorage */
angular.module('core').controller('AuthenticationController', [ '$scope', '$state', '$stateParams', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'constants', 'toastr', 'authToken', 'authenticationService',
  function ($scope, $state, $stateParams, $http, $location, $window, Authentication, PasswordValidator, constants, toastr, authToken, authenticationService) {
    $scope.reset = false
    $scope.authentication = Authentication
    $scope.popoverMsg = PasswordValidator.getPopoverMsg()
    $scope.credentials = {}
    $scope.credentials.email = $stateParams.email

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
    if ($state.is('signin') && $scope.authentication.user && !$state.is('authentication.reset')) {
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
          $state.go('storeOwner.reports', $state.previous.params)
        }
      }
    }

    function onUpdateError (err) {
      toastr.error(err.message)
      console.error(err)
    }

    $scope.loginFacebookUser = function () {
      authenticationService.getFacebookUserData().then(
        function (fbData) {
          console.log(fbData)
          authenticationService.signinFacebook({email: fbData.email}).catch(function (err) {
            if (err && err.data && err.data.message) {
              toastr.error(err.data.message)
            } else {
              toastr.error('Something went wrong while trying to login')
            }
          })
        }).catch(
        function (error) {
          toastr.error(error.message)
        })
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
