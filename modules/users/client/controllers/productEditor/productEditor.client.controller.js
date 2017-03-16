angular.module('users').controller('productEditorController', function ($scope, Authentication, $q, $http, productEditorService,
  $location, $state, $stateParams, Countries, orderDataService,
  $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, $timeout, ProductTypes, cfpLoadingBar, $analytics, $mdDialog, $sce) {
  // we should probably break this file into smaller files,
  // it's a catch-all for the entire productEditor

  Authentication.user = Authentication.user || { roles: '' }
  $scope.$state = $state
  $scope.pes = productEditorService
  $scope.mergeService = mergeService
  $scope.orderDataService = orderDataService
  $scope.Countries = Countries
  $scope.userId = window.localStorage.getItem('userId')
  $scope.display = {
    myProducts: false,
    feedback: true,
    template: ''
  }
  $scope.selectedStore = {}
  $scope.allSelected = { value: false }
  $scope.ui = { searchText: '' }
  $scope.permissions = {
    editor: Authentication.user.roles.indexOf(1010) > -1 || Authentication.user.roles.indexOf(1004) > -1,
    curator: Authentication.user.roles.indexOf(1011) > -1 || Authentication.user.roles.indexOf(1004) > -1
  }

  $scope.mediumEditorOptions = {
    imageDragging: false,
    extensions: {
      's3-image-uploader': new MediumS3ImageUploader()
    }
  }
  productEditorService.checkForNewProducts()
  if ($stateParams.productId) {
    productEditorService.setCurrentProduct($stateParams)
    if ($state.includes('editor.match')) {
      $state.go('editor.match.view', { productId: $stateParams.productId, status: $stateParams.status })
    } else {
      $state.go('editor.view', { productId: $stateParams.productId, status: $stateParams.status })
    }
  }
  $scope.search = {}
  $scope.checkbox = {
    progress: '',
    beer: true,
    wine: true,
    spirit: true
  }
  $scope.filter = [{'type': 1}, {'type': 2}, {'type': 3}]

  $scope.listOptions = {}
  $scope.listOptions.searchLimit = 50
  $scope.listOptions.searchInAll = true
  $scope.listOptions.searchInName = true
  $scope.listOptions.searchInDescription = true
  $scope.listOptions.searchInProductId = true
  $scope.listOptions.searchInSKU = true
  $scope.listOptions.searchInNotes = true
  $scope.listOptions.orderBy = '+name'
  $scope.listOptions.nomore = true
  if (window.localStorage.getItem('filterByUserId')) {
    $scope.listOptions.filterByUserId = true
  } else {
    $scope.listOptions.filterByUserId = false
  }
  $scope.listOptions.userId = $scope.userId

  $scope.toggleSearchInAll = function () {
    var value
    $scope.listOptions.searchInAll ? value = true : value = false
    $scope.listOptions.searchInName = value
    $scope.listOptions.searchInDescription = value
    $scope.listOptions.searchInProductId = value
    $scope.listOptions.searchInSKU = value
    $scope.listOptions.searchInNotes = value
  }

  $scope.loadMore = function () {
    $scope.loadingMoreData = true
    productEditorService.loadMoreProducts($scope.ui.searchText, searchOptions()).then(function (moreProducts) {
      $scope.allProducts = productEditorService.allProducts
    }).finally(function () {
      $scope.loadingMoreData = false
    })
  }

  if (orderDataService.allStores.length === 0) {
    orderDataService.getAllStores()
  }
  $scope.isStoreSelected = function (store) {
    var i = _.findIndex(orderDataService.allStores, function (s) {
      return s.storeId === store.storeId
    })
    return orderDataService.allStores[ i ].selected
  }
  $scope.toggleSearchStore = function (store) {
    var i = _.findIndex(orderDataService.allStores, function (s) {
      return s.storeId === store.storeId
    })
    orderDataService.allStores[ i ].selected = !orderDataService.allStores[ i ].selected
  }

  $scope.testSelectedStore = function () {
    console.log('selected %O', $scope.selectedStore.storeId)
  }

  $scope.reOrderList = function (field) {
    switch (field) {
      case 'name':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+n' ? '-name' : '+name'
        break
      case 'sku':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 4) === '+sku' ? '-sku_count' : '+sku_count'
        break
      case 'audio':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+a' ? '-audio' : '+audio'
        break
      case 'image':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+i' ? '-image' : '+image'
        break
      case 'status':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 4) === '+sta' ? '-status' : '+status'
        break
      case 'type':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+p' ? '-productTypeId' : '+productTypeId'
        break
      default:
        break
    }
    refreshList()
  }

  $scope.newProductsLabel = 'New Products Available'
  $scope.newProductLimit = 0
  $scope.loadNewProducts = function () {
    $scope.newProductsLabel = 'Load more new products'
    $scope.loadingData = true
    $scope.newProductLimit += 100
    // this is a hack to force angular to redraw the page
    $timeout(function () {
      productEditorService.viewNewProducts($scope.newProductLimit).then(function () {
        $scope.loadingData = false
      })
    }, 0)
  }

  $scope.searchProducts = function (searchText) {
    //  Just reset new products logic
    $scope.newProductsLabel = 'New Products Available'
    $scope.newProductLimit = 0
    $scope.allProducts = []
    $scope.selected = []

    $scope.loadingData = true
    $scope.loadingMoreData = false

    $scope.listOptions.searchText = searchText
    productEditorService.getProductList(searchText, searchOptions()).then(function (products) {
      $scope.allProducts = products
    }).finally(function () {
      $scope.loadingData = false
    })
  }

  var refreshList = function () {
    $scope.searchProducts($scope.ui.searchText)
  }

  $scope.toggleSelected = function (product) {
    $scope.selected = $scope.selected || []
    var i = _.findIndex($scope.selected, function (selectedProduct) {
      return selectedProduct.productId === product.productId
    })
    if (i < 0) {
      $scope.selected.push(product)
    } else {
      $scope.selected.splice(i, 1)
    }
    if ($state.includes('editor.match')) {
      orderDataService.storeSelected($scope.selected)
    }
  }

  $scope.toggleAll = function () {
    var sel = $scope.allSelected.value
    $scope.selected = []
    _.forEach(productEditorService.productList, function (p) {
      if (sel) {
        $scope.selected.push(p)
      }
      p.selected = sel
    })
    if ($state.includes('editor.match')) {
      orderDataService.storeSelected($scope.selected)
    }
  }

  $scope.viewProduct = function (product) {
    productEditorService.setCurrentProduct(product)

    if ($state.includes('editor.match')) {
      $state.go('editor.match.view', { productId: product.productId, status: $stateParams.status })
    } else {
      $state.go('editor.view', { productId: product.productId, status: $stateParams.status })
    }
  }

  $scope.getModalData = function () {
    productEditorService.getProduct($scope.selected[ $scope.selected.length - 1 ])
      .then(function (response) {
        $scope.modalData = response
      }
    )
  }

  $scope.quickEdit = function (product) {
    productEditorService.setCurrentProduct(product)
    if ($state.includes('editor.match')) {
      $state.go('editor.match.edit', { productId: product.productId, status: $stateParams.status })
    } else {
      $state.go('editor.edit', { productId: product.productId, status: $stateParams.status })
    }
  }

  $scope.updateFilter = function (value) {
    $scope.checked = false
    for (var i in $scope.filter) {
      if ($scope.filter[ i ].type === value.type) {
        $scope.filter.splice(i, 1)
        $scope.checked = true
      }
    }
    if (!$scope.checked) {
      $scope.filter.push(value)
    }
  }

  $scope.submitForApproval = function (product) {
    $analytics.eventTrack('Product Submitted', { productId: product.productId, user: Authentication.user.displayName })
    product.status = 'done'
    var options = {
      userId: $scope.userId,
      productId: product.productId,
      status: 'done'
    }
    productEditorService.claim(options).then(function () {
      productEditorService.save(product).then(function () {
        $('.modal-backdrop').remove()
      })
    })
  }

  $scope.issues = [
    'Problem With Image',
    'Problem With Text',
    'Problem With Audio'
  ]

  $scope.feedback = {
    issue: '',
    comments: ''
  }

  $scope.selectIssue = function (issue) {
    $scope.feedback.issue = issue
  }

  $scope.sendBack = function () {
    var product = productEditorService.currentProduct
    var feedback = {
      issue: $scope.feedback.issue,
      comments: $scope.feedback.comments,
      date: new Date()
    }
    productEditorService.updateFeedback(feedback).then(function () {
      var productItem = _.find(productEditorService.productList, { productId: product.productId }) || {}
      product.status = productItem.status = 'new'
      product.feedback = product.feedback || []
      product.feedback.push(feedback)
    })
  }

  $scope.approveSelectedProducts = function () {
    productEditorService.bulkUpdateStatus($scope.selected, 'approved')
  }

  $scope.rejectSelectedProducts = function () {
    productEditorService.bulkUpdateStatus($scope.selected, 'inprogress')
  }

  $scope.approveProduct = function (product) {
    $analytics.eventTrack('Approved Product', { productId: product.productId })
    product.status = 'approved'
    productEditorService.save(product)
  }

  $scope.save = function (product) {
    $analytics.eventTrack('Product Saved', { productId: product.productId })
    product.status = 'inprogress'
    productEditorService.save(product)
  }

  $scope.updateProduct = function (product) {
    if (product.status !== 'done') {
      product.status = 'inprogress'
    }
    productEditorService.save(product)
  }

  $scope.changeType = function (product, typeId) {
    product.productTypeId = typeId
  }

  $scope.markAsNew = function (product) {
    if (product.status === 'new') return
    product.status = 'new'
    productEditorService.save(product)
  }

  $scope.deleteProduct = function (product) {
    product.status = 'deleted'
    productEditorService.save(product).then(function () {
      if ($state.includes('editor.match')) {
        $state.go('editor.match.view', { productId: product.productId, status: $stateParams.status })
      } else {
        $state.go('editor.view', {productId: product.productId})
      }
    })
  }

  $scope.assignSelectedToUser = function (editor) {
    $scope.selected.forEach(function (product) {
      var options = {
        username: editor.displayName || editor.email,
        userId: $scope.userId,
        productId: product.productId,
        status: 'inprogress'
      }
      productEditorService.claim(options)
    })
  }

  // Audio/Image functions

  $scope.playAudio = function () {
    productEditorService.currentProduct.audio.play()
  }
  $scope.pauseAudio = function () {
    productEditorService.currentProduct.audio.pause()
  }
  $scope.removeAudio = function () {
    var currentAudio = productEditorService.currentProduct.audio.mediaAssetId
    productEditorService.removeAudio(currentAudio)
  }
  $scope.seekAudio = function () {
    productEditorService.currentProduct.audio.currentTime = productEditorService.currentProduct.audio.progress * productEditorService.currentProduct.audio.duration
  }
  // ignore this
  $scope.removeImage = function (current) {
    productEditorService.removeImage(current)
  }

  $(window).bind('keydown', handleShortcuts)
  $scope.$on('$destroy', function () {
    $(window).unbind('keydown', handleShortcuts)
  })

  $scope.productsSelection = {}
  $scope.productsSelection.contains = false
  // Functions related to merging //

  $scope.mergeProducts = function () {
    cfpLoadingBar.start()
    mergeService.merge($scope.selected).then(function () {
      if ($state.includes('editor.match')) {
        $state.go('editor.match.merge', $stateParams, { reload: true })
        $scope.selected = []
      } else {
        $state.go('editor.merge')
      }
    }).finally(function () {
      cfpLoadingBar.complete()
    })
  }

  $scope.uploadNewImageFromMerge = function (file) {
    productEditorService.setCurrentProduct(mergeService.products[ 0 ]).then(function () {
      productEditorService.uploadMedia(file).then(function () {
        productEditorService.getProductDetail(mergeService.products[ 0 ]).then(function (response) {
          var refreshedProduct = response.data[ 0 ]
          mergeService.refreshProductImage(_.last(refreshedProduct.mediaAssets))
        })
      })
    })
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

  $scope.toggleFilterUserId = function () {
    if ($scope.listOptions.filterByUserId) {
      window.localStorage.setItem('filterByUserId', 'true')
    } else {
      window.localStorage.removeItem('filterByUserId')
    }
    refreshList()
  }

  $scope.createNewProduct = function () {
    var product = orderDataService.currentItem
    productEditorService.createNewProduct(product)
    $state.go('editor.match.new', $stateParams)
  }

  $scope.deleteFeedback = function (feedback) {
    feedback.deleting = true
    var product = productEditorService.currentProduct
    productEditorService.deleteFeedback(feedback).then(function () {
      removeItem(product.feedback, feedback)
    }).finally(function () {
      feedback.deleting = false
    })
  }

  $scope.confirmDeleteProductSKU = function (ev, product, sku) {
    var confirm = $mdDialog.confirm()
      .title('Delete UPC?')
      .textContent('Please confirm whether you want to remove SKU for this product?')
      .targetEvent(ev)
      .ok('Delete')
      .cancel('Cancel')

    $timeout(function () {
      $('.md-dialog-container').addClass('delete confirm')
    })

    return $mdDialog.show(confirm).then(function () {
      return productEditorService.deleteProductSKU(product, sku)
    })
  }

  $rootScope.$on('clearProductList', function () {
    $scope.selected = []
    productEditorService.productList.forEach(function (p) {
      p.selected = false
    })
  })
  $rootScope.$on('searchdb', function () {
    console.log('clearing search text')
    $state.go('editor.match', $stateParams, { reload: true })
  })

  function removeItem (arr, item) {
    var idx = _.indexOf(arr, item)
    if (idx < 0) return false
    arr.splice(idx, 1)
    return true
  }

  function searchOptions () {
    var inColumns = ''
    if ($scope.listOptions.searchInName) inColumns += 'name+'
    if ($scope.listOptions.searchInDescription) inColumns += 'description+'
    if ($scope.listOptions.searchInProductId) inColumns += 'id+'
    if ($scope.listOptions.searchInSKU) inColumns += 'sku+'
    if ($scope.listOptions.searchInNotes) inColumns += 'notes'
    if (inColumns === '') {
      inColumns = 'name'
      $scope.listOptions.searchInName = true
    }
    inColumns = encodeURIComponent(inColumns)
    var options = { status: $scope.checkbox.progress, types: $scope.filter, filter: $scope.listOptions, inColumns: inColumns, ignoreLoadingBar: true }
    if ($scope.selectedStore.storeId) {
      options.store = $scope.selectedStore
    }
    return options
  }

  function handleShortcuts (event) {
    if (event.ctrlKey || event.metaKey) {
      var prod = productEditorService.currentProduct

      switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
          event.preventDefault()
          $scope.updateProduct(prod)
          break
        case 'd':
          event.preventDefault()
          $scope.submitForApproval(prod)
      }
    }
  }
})
