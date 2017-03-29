'use strict'
/* global angular, _ */
angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$mdDialog', '$state', '$http', 'toastr', 'constants', 'authToken', 'Users',
  function ($scope, Authentication, $mdDialog, $state, $http, toastr, constants, authToken, Users) {
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
      } else if (!Authentication.user.accountId) {
        $state.go('getStarted', { step: 2 })
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
      $scope.stuff.email = $scope.stuff.passuser
      Users.resetPassword($scope.stuff.email).then(function (response) {
        $scope.credentials = null
        $scope.reset = false
        toastr.success('Reset Password Email Sent')
      }, function (error) {
        console.log('Error Forgot Password: ', error)
        toastr.error('Can not reset password. Please contact Support')
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
