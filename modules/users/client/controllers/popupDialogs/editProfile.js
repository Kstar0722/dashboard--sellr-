angular.module('core').controller('EditProfileController', function ($scope, $mdDialog, Authentication, Users, toastr, constants, $http) {
  //
  // DEFINITIONS
  //
  $scope.dialog = {}
  $scope.dialog.title = 'Accounts Details'

  //
  // INITIALIZATION
  //
  $scope.dialog.user = Authentication.user

  //
  // SCOPE FUNCTIONS
  //
  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  $scope.updateUserProfile = function (isValid) {
    if (!isValid) {
      toastr.error('Please complete the user form')
      return false
    }

    $scope.dialog.user.displayName = $scope.dialog.user.firstName + ' ' + $scope.dialog.user.lastName

    Users.put($scope.dialog.user).then(function (response) {
      Authentication.user = angular.extend(Authentication.user, response.data)
      localStorage.setItem('userObject', JSON.stringify(Authentication.user))
      toastr.success('Profile saved successfully')
    }, function (response) {
      toastr.error(response.data.message)
    })
  }

  $scope.changeUserPassword = function (isValid) {
    if (!isValid) {
      toastr.error('Please complete the Password form')
      return false
    }
    if ($scope.dialog.passwordDetails.newPassword !== $scope.dialog.passwordDetails.newPassword2) {
      toastr.error('New password fields do not match')
      return false
    }

    var payload = {
      payload: {
        email: Authentication.user.email,
        token: Authentication.user.salt,
        password: $scope.dialog.passwordDetails.newPassword,
        oldPassword: $scope.dialog.passwordDetails.currentPassword
      }
    }
    $http.post(constants.API_URL + '/users/auth/reset', payload).then(function (response) {
      $scope.dialog.passwordDetails = {}
      $scope.passwordForm.$setPristine()
      $scope.passwordForm.$setUntouched()
      toastr.success('Password changed successfully')
    }, function (response) {
      toastr.error(response.data.message)
    })
  }

  //
  // INTERNAL FUNCTIONS
  //

  //
  // EVENTS
  //
})
