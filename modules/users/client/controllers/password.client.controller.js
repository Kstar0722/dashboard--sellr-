/* globals angular, localStorage */
'use strict'

angular.module('users').controller('PasswordController', [ '$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator', 'constants', 'toastr', 'authToken', '$state',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator, constants, toastr, authToken, $state) {
    $scope.authentication = Authentication
    $scope.popoverMsg = PasswordValidator.getPopoverMsg()

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/')
    }

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null
      var resetObj = {
        payload: {
          oldPassword: $location.search().token,
          email: $location.search().email,
          password: $scope.passwordDetails.newPassword
        }
      }
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm')

        return false
      }
      debugger
      console.log('new pass details %0', resetObj)
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
            toastr.error('Invalid Token. Please contact support at support@getsellr.com')
          }
          // If successful we assign the response to the global user model
          authToken.setToken(response.data.token)
          // set roles
          localStorage.setItem('roles', response.data.roles)
          // store account Id in location storage
          localStorage.setItem('accountId', response.data.accountId)
          // set userId
          localStorage.setItem('roles', response.data.roles)
          localStorage.setItem('userId', response.data.userId)
          localStorage.setItem('userObject', JSON.stringify(response.data))
          $scope.authentication.user = response.data

          $state.go('dashboard', $state.previous.params)
        })
      })
    }
  }
])
