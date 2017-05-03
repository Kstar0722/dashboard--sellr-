angular.module('core').controller('AuthenticationController', function ($scope, $stateParams, $state, $location, constants, $http, authToken, authenticationService, toastr, Users) {
  $scope.ui = {}
  $scope.ui.credentials = {}
  $scope.ui.credentials.email = $stateParams.email || $state.params.email
  $scope.ui.resetPassword = {}
  $scope.ui.resetEmail = ''
  $scope.signin = function (formValid) {
    if (!formValid) {
      return false
    }
    authenticationService.signin($scope.ui.credentials).catch(function (err) {
      console.log(err)
    })
  }
  $scope.sendResetPasswordRequest = function (formValid) {
    if (!formValid) {
      return false
    }
    Users.resetPassword($scope.ui.resetEmail).then(function (response) {
      $scope.ui.resetEmail = ''
      $scope.ui.credentials = {}
      toastr.success('Reset Password Email Sent')
      $state.go('authentication.signin')
    }, function (error) {
      console.log('Error Forgot Password: ', error)
      toastr.error('Can not reset password. Please contact Support')
    })
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
  $scope.submitResetPassword = function (formValid) {
    $scope.ui.resetPassword.passwordDoNotMatch = false
    if (!formValid) {
      return false
    }
    if ($scope.ui.resetPassword.newPassword !== $scope.ui.resetPassword.verifyPassword) {
      $scope.ui.resetPassword.passwordDoNotMatch = true
      return false
    }
    if (!$location.search().token || !$location.search().email) {
      toastr.error('Invalid Token. Please contact support at support@getsellr.com')
      $state.go('authentication.signin')
      return false
    }
    var resetObj = {
      payload: {
        oldPassword: $location.search().token,
        email: $location.search().email.replace(/%2B/gi, '+'),
        password: $scope.ui.resetPassword.newPassword
      }
    }

    $http.post(constants.API_URL + '/users/auth/reset', resetObj).then(function (response, err) {
      if (err) {
        toastr.error('Invalid Token. Please contact support at support@getsellr.com')
      }
      var userLogin = {
        payload: {
          email: resetObj.payload.email,
          password: resetObj.payload.password
        }
      }

      $http.post(constants.API_URL + '/users/login', userLogin).then(function (response, err) {
        if (err) {
          toastr.error('Error while auto signin in. Please try again with your new password.')
        } else {
          toastr.success('Password reset success. Please sign in with your new password.')
        }
        $state.go('authentication.signin', {email: resetObj.payload.email})
      })
    })
  }
})
