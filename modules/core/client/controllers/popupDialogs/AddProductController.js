angular.module('core').controller('AddProductController', function ($scope, toastr, storesService, $mdDialog, $state, productsService, uploadService) {
  //
  // DEFINITIONS
  //
  $scope.add = {}
  $scope.add.step = 1
  $scope.add.actionDisabled = true
  $scope.planSelectConfig =
  {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'planId',
    labelField: 'name',
    sortField: 'name',
    searchField: [ 'name' ]
  }

  //
  // INITIALIZATION
  //
  init()

  //
  // SCOPE FUNCTIONS
  //
  $scope.submitProduct = function () {
    var mediaConfig = {
      mediaRoute: 'media',
      folder: 'images',
      type: 'RESEARCH_IMG',
      fileType: 'RESEARCH_IMG',
      accountId: $scope.add.accountId
    }
    uploadService.upload($scope.add.tempImage, mediaConfig).then(function (res) {
      $scope.add.researchImage = res.publicUrl
      var hmcProduct = mapProduct()
      productsService.addNotFound(hmcProduct).then(function () {
        toastr.success('New product added')
        $scope.closeDialog()
      })
    }, function (err) {
      console.error('upload error %O', err)
    })
  }

  $scope.checkFormValid = function () {
    if ($scope.add.sku && $scope.add.planId && $scope.add.tempImage) {
      $scope.add.actionDisabled = false
    } else {
      $scope.add.actionDisabled = true
    }
  }

  $scope.closeDialog = function () {
    $mdDialog.hide()
  }

  $scope.uploadProductImage = function (files) {
    if (_.isEmpty(files)) {
      return
    }
    $scope.add.tempImage = files[0]
    $scope.checkFormValid()
  }

  $scope.removeProductImage = function () {
    $scope.add.tempImage = null
    $scope.checkFormValid()
  }

  //
  // PRIVATE FUNCTIONS
  //
  function init () {
    $scope.planSelectOptions = _.map(productsService.currentPlans, function (p) { return {name: p.label, planId: p.planId} })
    $scope.add.accountId = storesService.currentAccountId
    $scope.add.storeId = productsService.currentStoreId
  }

  function mapProduct () {
    var data = $scope.add
    return {
      accountId: data.accountId,
      storeId: data.storeId,
      planId: data.planId,
      skus: [ data.sku ],
      researchImage: data.researchImage,
      source: 'Dashboard'
    }
  }
})
