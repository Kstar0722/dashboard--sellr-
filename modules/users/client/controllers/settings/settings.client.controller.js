'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', '$timeout', '$window', 'FileUploader', 'Users', 'Authentication', 'PasswordValidator', 'constants', 'toastr',
  function ($scope, $http, $location, $timeout, $window, FileUploader, Users, Authentication, PasswordValidator, constants, toastr) {
    $scope.user = initUser(Authentication.user);
    $scope.passwordDetails = {};

    // $scope.imageURL = $scope.user.profileImageURL;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }

      $scope.user.displayName = $scope.user.firstName + ' ' + $scope.user.lastName;

      Users.put($scope.user).then(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');
        updateUserProfile(response.data);
        toastr.success('Profile saved successfully');
      }, function (response) {
        toastr.error(response.data.message);
      });
    };

    // Change user password
    $scope.changeUserPassword = function (isValid) {
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
        $scope.passwordDetails = null;
        toastr.success('Password changed successfully');
      }).error(function (response) {
        toastr.error(response.data.message);
      });
    };

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.avatar_success = true;

      // Populate user object
      updateUserProfile(response);

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.avatar_error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.avatar_success = $scope.avatar_error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };

    function updateUserProfile(user) {
      angular.extend($scope.user, user);
      Authentication.user = angular.extend(Authentication.user, user);
      localStorage.setItem('userObject', JSON.stringify(Authentication.user))
    }

    function initUser(user) {
      var result = angular.copy(user);
      if (!('firstName' in result) && !('lastName' in result)) {
        var tmp = result.displayName.split(/\s+/);
        result.firstName = tmp[0];
        result.lastName = tmp[1];
        delete result.displayName;
      }
      return result;
    }
  }
]);
