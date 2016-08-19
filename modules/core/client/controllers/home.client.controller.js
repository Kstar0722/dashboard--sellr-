'use strict'
/* global angular, _ */
angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$mdDialog', '$state', '$http', 'toastr', 'constants', 'authToken',
  function ($scope, Authentication, $mdDialog, $state, $http, toastr, constants, authToken) {
    // This provides Authentication context.
    $scope.authentication = Authentication
    $scope.stuff = {}

    function redirect () {
      if (hasRole(1002) || hasRole(1004) || hasRole(1007) || hasRole(1009)) {
        $state.go('dashboard')
      } else if (hasRole(1010) || hasRole(1011)) {
        $state.go('editor.products')
      } else if (hasRole(1012)) {
        $state.go('supplier.media')
      }
    }

    function hasRole (role) {
      return (_.contains(Authentication.user.roles, role))
    }

    if (Authentication.user && authToken.hasTokenInStorage()) {
      redirect()
    }

    $scope.askForPasswordReset = function (isValid) {
      console.log('ask for password called %O', $scope.stuff)
      $scope.success = $scope.error = null

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm')

        return false
      }
      $scope.stuff.username = $scope.stuff.passuser
      var payload = {
        payload: {
          username: $scope.stuff.username
        }
      }
      $http.post(constants.API_URL + '/users/auth/forgot', payload).then(function (response, err) {
        if (err) {
          toastr.error('Can not reset password. Please contact Support')
        }
        // Show user success message and clear form
        $scope.credentials = null
        var mailOptions = {
          payload: {
            source: 'password',
            email: response.data.email,
            title: 'Password Reset Success',
            body: '<body> <p>Dear ' + $scope.stuff.username + ',</p> <br /> <p>You have requested to have your password reset for your account at the Sellr Dashboard </p> <p>Please visit this url to reset your password:</p> <p>' + 'https://sellrdashboard.com/authentication/reset?token=' + response.data.token + '&username=' + response.data.username + "</p> <strong>If you didn't make this request, you can ignore this email.</strong> <br /> <br /> <p>The Sellr Support Team</p> </body>"
          }
        }
        if (response) {
          $http.post(constants.API_URL + '/emails', mailOptions).then(function (res, err) {
            if (err) {
              toastr.error('Can not reset password. Please contact Support')
            }
            $scope.reset = false
            toastr.success('Reset Password Email Sent')
          })
        }
      })
    }
    $scope.testFunction = function (ev) {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(true)
          .title('This is an alert title')
          .textContent('You can specify some description text in here.')
          .ariaLabel('Alert Dialog Demo')
          .ok('Got it!')
          .targetEvent(ev)
      )
      console.log('test')
    }
  }
])
