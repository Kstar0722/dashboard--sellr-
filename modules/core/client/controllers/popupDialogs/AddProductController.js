angular.module('core').controller('AddProductController', function ($scope, toastr, storesService, $mdDialog, $state, productsService, uploadService, utilsService) {
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
      $scope.add.mediaAssets = [res.mediaAssetId]
      var hmcProduct = mapProduct($scope.add)
      productsService.addNotFound(hmcProduct).then(function () {
        toastr.success('The product was submitted successfully')
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
    $scope.add.accountId = utilsService.currentAccountId
    $scope.add.storeId = utilsService.currentStoreId
  }

  function mapProduct (product) {
    debugger
    return {
      accountId: product.accountId,
      storeId: product.storeId,
      planId: utilsService.convertToInt(product.planId),
      skus: [product.sku],
      researchImage: product.researchImage,
      source: 'Dashboard',
      prices: [],
      mediaAssets: product.mediaAssets
    }
  }
})
