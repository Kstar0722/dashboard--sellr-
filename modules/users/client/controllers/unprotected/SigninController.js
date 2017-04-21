angular.module('core').controller('SigninController', function ($scope, $stateParams, $state, authenticationService, toastr, Users) {
  $scope.ui = {}
  $scope.ui.resetpass = false
  $scope.ui.credentials = {}
  $scope.ui.resetEmail = ''
  $scope.signin = function (isValid) {
    if (!isValid) {
      return false
    }
    authenticationService.signin($scope.ui.credentials).catch(function (err) {
      console.log(err)
    })
  }
  $scope.resetPassword = function (isValid) {
    if (!isValid) {
      return false
    }
    Users.resetPassword($scope.ui.resetEmail).then(function (response) {
      $scope.ui.resetEmail = ''
      $scope.ui.credentials = {}
      $scope.ui.resetpass = false
      toastr.success('Reset Password Email Sent')
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
})
