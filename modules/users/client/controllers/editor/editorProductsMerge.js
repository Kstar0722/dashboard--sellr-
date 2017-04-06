angular.module('core').controller('EditorProductsMergeController', function ($scope, Authentication, $q, $http, productEditorService, $location, $state, $stateParams, Countries, orderDataService, $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, $timeout, ProductTypes, cfpLoadingBar, $analytics, $mdDialog, $sce, globalClickEventName) {
  //
  // DEFINITIONS
  //
  $scope.ui.display = 'mergeProduct'
  $scope.mergeService = mergeService
  $scope.ProductTypes = ProductTypes

  $scope.productTypeConfig = {
    create: false,
    maxItems: 1,
    allowEmptyOption: false,
    valueField: 'productTypeId',
    labelField: 'name'
  }

  $scope.removeMergedImage = function (i) {
    mergeService.newProduct.images.splice(i, 1)
  }

  $scope.playMergedAudio = function (i) {
    for (var a = 0; a < mergeService.newProduct.audio.length; a++) {
      mergeService.newProduct.audio[ a ].pause()
      mergeService.newProduct.audio[ a ].currentTime = 0
      if (a === i) {
        mergeService.newProduct.audio[ i ].play()
      }
    }
  }

  $scope.pauseMergedAudio = function () {
    mergeService.newProduct.audio.forEach(function (a) {
      a.pause()
    })
  }

  $scope.removeMergedAudio = function (i) {
    mergeService.newProduct.audio[ i ].pause()
    mergeService.newProduct.audio.splice(i, 1)
  }

  $scope.uploadMergeImage = function (file) {
    productEditorService.setCurrentProduct(mergeService.products[ 0 ]).then(function () {
      productEditorService.uploadMedia(file).then(function () {
        productEditorService.getProductDetail(mergeService.products[ 0 ]).then(function (response) {
          var refreshedProduct = response.data[ 0 ]
          mergeService.refreshProductImage(_.last(refreshedProduct.mediaAssets))
        })
      })
    })
  }

  $(window).bind('keydown', handleShortcuts)
  $scope.$on('$destroy', function () {
    $(window).unbind('keydown', handleShortcuts)
  })

  function handleShortcuts (event) {
    if (event.ctrlKey || event.metaKey) {
      switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
          event.preventDefault()
          mergeService.save()
          break
      }
    }
  }
})
