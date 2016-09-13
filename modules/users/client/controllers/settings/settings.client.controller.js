'use strict';
/* globals moment */

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', '$timeout', '$window', 'FileUploader', 'Users', 'Authentication', 'PasswordValidator', 'constants', 'toastr',
  function ($scope, $http, $location, $timeout, $window, FileUploader, Users, Authentication, PasswordValidator, constants, toastr) {
    $scope.user = angular.copy(Authentication.user);
    $scope.store = {};

    $scope.popoverMsg = PasswordValidator.getPopoverMsg();
    $scope.aboutCharsLimit = 200;

    $scope.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.workSchedule = $scope.weekdays.map(function (weekday) {
      return { name: weekday, open: false, openTime: null, closeTime: null };
    });

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }

      Users.put($scope.user).then(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');
        updateUserProfile(response.data);
        toastr.success('Profile saved successfully');
      }, function (response) {
        toastr.error(response.data.message);
      });
    };

    $scope.updateStoreProfile = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }

      // todo
    };

    $scope.cancelOverLimited = function(ev) {
      if ($scope.aboutCharsLeft <= 0 && String.fromCharCode(ev.charCode).length > 0) {
        ev.preventDefault()
      }
    };

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.password_success = $scope.password_error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');
        return false;
      }

      var payload = {
        payload: {
          email: Authentication.user.email,
          token: Authentication.user.salt,
          password: $scope.passwordDetails.newPassword,
          oldPassword: $scope.passwordDetails.currentPassword
        }
      };
      $http.post(constants.API_URL + '/users/auth/reset', payload).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.password_success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.password_error = response.message;
      });
    };

    $scope.$watch('store.about', function(about) { limitAboutLength(about); });
    $scope.$watch('aboutCharsLimit', function() { limitAboutLength(); });

    function updateUserProfile(user) {
      angular.extend($scope.user, user);
      Authentication.user = angular.extend(Authentication.user, user);
      localStorage.setItem('userObject', JSON.stringify(Authentication.user))
    }

    function limitAboutLength(about) {
      about = about || $scope.store.about;
      var aboutText = $('<div>').html((about || '').trim().replace(/&nbsp;/g, ' ')).text();
      $scope.aboutCharsLeft = $scope.aboutCharsLimit - aboutText.length;
      if ($scope.aboutCharsLeft < 0) {
        $scope.store.about = aboutText.substr(0, $scope.aboutCharsLimit);
      }
    }
  }
]);
