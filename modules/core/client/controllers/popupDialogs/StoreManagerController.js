/* globals angular, localStorage */
angular.module('core').controller('StoreManagerController', function ($scope, $mdDialog, storesService, $state, accountsService, CurrentUserService, UsStates, $q, uploadService, utilsService) {
  //
  // DEFINITIONS
  //
  $scope.storesService = storesService
  $scope.UsStates = UsStates
  $scope.stateSelectConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'abbreviation',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }
  $scope.ui = {}

  //
  // SCOPE FUNCTIONS
  //
  $scope.newStore = function () {
    $scope.isNewStore = true
    $scope.activeStore = {}
    initActiveStore()
    // when first created accont this is undefined so checking first
    if ($scope.storeForm) {
      $scope.storeForm.$setPristine()
      $scope.storeForm.$setUntouched()
    }
  }

  $scope.changeStore = function (index) {
    $scope.tempStoreImage = null
    if (storesService.stores[index]) {
      $scope.activeStore = storesService.stores[index]
      initActiveStore()
      $scope.isNewStore = false
    } else {
      $scope.newStore()
    }
  }

  $scope.removeStoreImage = function () {
    $scope.tempStoreImage = null
    $scope.activeStore.details.storeImg = ''
  }

  $scope.uploadStoreImage = function (files) {
    if (_.isEmpty(files)) {
      return
    }
    $scope.tempStoreImage = files[0]
  }

  $scope.submitStore = function (formValid) {
    if (!formValid) {
      setFieldsTouched($scope.storeForm.$error)
      return false
    }

    saveImage().then(function (response) {
      if (response) {
        $scope.activeStore.details.storeImg = response.publicUrl
      }
      if ($scope.isNewStore) {
        storesService.createStore($scope.activeStore).then(function () {
          $scope.changeStore(storesService.stores.length - 1)
        })
      } else {
        storesService.updateStore($scope.activeStore).then(function () {})
      }
    })
  }

  $scope.deleteStore = function () {
    storesService.deleteStore($scope.activeStore.storeId).then(function () {
      if (storesService.stores.length) {
        $scope.changeStore(0)
      } else {
        $scope.newStore()
      }
    })
  }

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  //
  // INITIALIZATION
  //
  $scope.changeStore(0)

  //
  // INTERNAL FUNCTIONS
  //
  function initActiveStore () {
    $scope.ui.deleteStoreMsg = false
    $scope.activeStore.details = $scope.activeStore.details || {}
    $scope.activeStore.details.contactInfo = $scope.activeStore.details.contactInfo || {}
    $scope.activeStore.details.workSchedule = $scope.activeStore.details.workSchedule || []
  }

  function saveImage () {
    var defer = $q.defer()
    if (!$scope.tempStoreImage) {
      defer.resolve()
    } else {
      var mediaConfig = {
        mediaRoute: 'media',
        folder: 'storeImg',
        type: 'STOREIMG',
        fileType: 'IMAGE',
        accountId: utilsService.currentAccountId
      }
      uploadService.upload($scope.tempStoreImage, mediaConfig).then(function (response) {
        defer.resolve(response)
      })
    }
    return defer.promise
  }

  function setFieldsTouched (formErrors) {
    angular.forEach(formErrors, function (field) {
      angular.forEach(field, function (errorField) {
        errorField.$setTouched()
      })
    })
  }
})
