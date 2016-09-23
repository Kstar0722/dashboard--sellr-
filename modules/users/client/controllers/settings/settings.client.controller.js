'use strict';
/* globals moment */

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', '$timeout', '$window', 'Users', 'Authentication', 'constants', 'toastr', 'uploadService', 'accountsService', 'PostMessage', '$mdMedia', 'orderDataService', '$sce',
  function ($scope, $http, $location, $timeout, $window, Users, Authentication, constants, toastr, uploadService, accountsService, PostMessage, $mdMedia, orderDataService, $sce) {
    $scope.user = initUser(Authentication.user);
    $scope.passwordDetails = {};
    $scope.store = {};

    $scope.accountsService = accountsService;
    $scope.descriptionCharsLimit = 200;
    $scope.weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.$mdMedia = $mdMedia;

    accountsService.bindSelectedAccount($scope);
    $scope.$watch('selectAccountId', function () {
      loadStore(accountsService.accounts);
    });

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

    $scope.updateStoreProfile = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'storeForm');
        return false;
      }

      var payload = {
        payload: $scope.store
      };

      $http.put(constants.BWS_API + '/storedb/stores/details', payload).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'storeForm');
        toastr.success('Store saved successfully');
      }).error(function (response) {
        toastr.error(response.data.message);
      });
    };

    $scope.uploadStoreImage = function (files, accountId) {
      var mediaConfig = {
        mediaRoute: 'media',
        folder: 'storeImg',
        type: 'STOREIMG',
        accountId: accountId
      };

      uploadService.upload(files[0], mediaConfig).then(function (response, err) {
        if (response) {
          $scope.store.storeImg = constants.ADS_URL + 'storeImg/' + response[ 0 ].mediaAssetId + '-' + response[ 0 ].fileName;
          toastr.success('Store Image Updated', 'Success!');
        }
      })
    };

    $scope.cancelOverLimited = function(ev) {
      if ($scope.descriptionCharsLeft <= 0 && String.fromCharCode(ev.charCode).length > 0) {
        ev.preventDefault()
      }
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

    $scope.openEmbedCodeModal = function (ev) {
      var $embedCodeModal = $('#embedCodeModal').on('shown.bs.modal', function (e) {
        var autofocus = $(e.target).find('[autofocus]')[ 0 ]
        if (autofocus) autofocus.focus()
      })

      $embedCodeModal.modal('show')
    };

    $scope.generateEmbedJsCode = function (host, storeId) {
      var code = $('#embedJsCodeTemplate').html()
        .replace(/{{host}}/g, host || '')
        .replace(/{{storeId}}/g, storeId || '');

      code = unindent(code);

      return $sce.trustAsHtml(code);
    };

    $scope.lines = function (text) {
      if (!text) return;
      return text.toString().split('\n').length;
    };

    $scope.embedCodeCopied = function () {
      toastr.success('Copied embed code to clipboard');
    };

    $scope.$watch('store.description', function(description) { limitDescriptionLength(description); });
    $scope.$watch('descriptionCharsLimit', function() { limitDescriptionLength(); });
    $scope.$watch('accountsService.accounts', loadStore);

    $scope.$watch('store', function (storeInfo) {
      // propagate store changes to preview iframe
      PostMessage.send('store.update', storeInfo);
    }, true);

    init();

    function init() {
      PostMessage.on('store.initialized', function () {
        PostMessage.send('store.update', $scope.store);
      });

      loadStore(accountsService.accounts);
    }

    function updateUserProfile(user) {
      angular.extend($scope.user, user);
      Authentication.user = angular.extend(Authentication.user, user);
      localStorage.setItem('userObject', JSON.stringify(Authentication.user))
    }

    function initUser(user) {
      if (!user) return user;

      var result = angular.copy(user);
      if (!('firstName' in result) && !('lastName' in result)) {
        var tmp = result.displayName.split(/\s+/);
        result.firstName = tmp[0];
        result.lastName = tmp.slice(1).join(' ');
        delete result.displayName;
      }
      return result;
    }

    function limitDescriptionLength(description) {
      description = description || $scope.store.description;
      var descriptionText = $('<div>').html((description || '').trim().replace(/&nbsp;/g, ' ')).text();
      $scope.descriptionCharsLeft = $scope.descriptionCharsLimit - descriptionText.length;
      if ($scope.descriptionCharsLeft < 0) {
        $scope.store.description = descriptionText.substr(0, $scope.descriptionCharsLimit);
      }
    }

    function loadStore(accounts) {
      if (_.isEmpty(accounts)) return;

      var account = _.find(accounts, { accountId: $scope.selectAccountId || $scope.user.accountId });
      if (!account) return $scope.store = null;

      orderDataService.getAllStores({ accountId: account.accountId }).then(function (stores) {
        var store = $scope.store = _.find(stores, { accountId: account.accountId }) || {};

        store.storeImg = store.storeImg || account.storeImg;
        store.details = store.details || {};
        store.details.workSchedule = initWorkSchedule(store.details.workSchedule);
        // store.previewUrl = constants.SHOPPR_URL + '/embedStore' + $scope.store.accountId + '.html#/stores?storeInfo=true';
        store.previewUrl = '/modules/users/client/views/settings/shoppr-preview.client.view.html';

        $scope.shopprEmbedJs = $scope.generateEmbedJsCode('app.shoppronline.com', account.accountId);
      });
    }

    function initWorkSchedule(workSchedule) {
      workSchedule = workSchedule || {};
      return $scope.weekdays.map(function (weekday, i) {
        var day = _.find(workSchedule, { name: weekday });
        if (!day) return { day: i, name: weekday, open: false, openTime: null, closeTime: null };
        if (day.openTime) day.openTime = moment.utc(day.openTime).toDate();
        if (day.closeTime) day.closeTime = moment.utc(day.closeTime).toDate();
        return day;
      });
    }

    function unindent(text) {
      if (!text) return text;
      var gIndent = text.match(/^(\s*)/)[0].length;
      var result = text.split('\n').map(function (line) {
        var indent = line.match(/^(\s*)/)[0].length;
        return line.substr(Math.min(gIndent, indent));
      }).join('\n').trim();
      return result;
    }
  }
]);
