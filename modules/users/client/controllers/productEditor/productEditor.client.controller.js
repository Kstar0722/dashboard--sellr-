/* globals angular, _, $*/
angular.module('users').controller('productEditorController', function ($scope, Authentication, $q, $http, productEditorService,
  $location, $state, $stateParams, Countries, orderDataService,
  $mdMenu, constants, MediumS3ImageUploader, $filter, mergeService, $rootScope, ProductTypes) {
  // we should probably break this file into smaller files,
  // it's a catch-all for the entire productEditor

  Authentication.user = Authentication.user || { roles: '' }
  $scope.$state = $state
  $scope.pes = productEditorService
  $scope.mergeService = mergeService
  $scope.Countries = Countries
  $scope.userId = window.localStorage.getItem('userId')
  $scope.display = {
    myProducts: false,
    feedback: true,
    template: ''
  }
  $scope.allSelected = {value: false}
  $scope.searchText = ''

  $http.get(constants.BWS_API + '/choose/orders?v=sum').then(function (res) {
    console.log('allStores %O', res.data)
    $scope.allStores = res.data
  })

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
  if ($stateParams.productId) {
    productEditorService.setCurrentProduct($stateParams)
    if ($state.includes('editor.match')) {
      $state.go('editor.match.view', { productId: $stateParams.productId })
    } else {
      $state.go('editor.view', { productId: $stateParams.productId })
    }
  }
  $scope.search = {}
  $scope.checkbox = {
    progress: ''
  }
  $scope.filter = []
  $scope.searchLimit = 15

  $scope.listOptions = {}
  $scope.listOptions.searchLimit = 15
  $scope.listOptions.orderBy = '+name'
  if (window.localStorage.getItem('filterByUserId')) {
    $scope.listOptions.filterByUserId = true
  } else {
    $scope.listOptions.filterByUserId = false
  }
  $scope.listOptions.userId = $scope.userId

  $scope.showMore = function () {
    $scope.listOptions.searchLimit += 15
    refreshList()
  }
  $scope.isStoreSelected = function (store) {
    var i = _.findIndex($scope.allStores, function (s) {
      return s.id === store.id
    })
    return $scope.allStores[ i ].selected
  }

  $scope.toggleSearchStore = function (store) {
    $scope.allStores = $scope.allStores || []
    var i = _.findIndex($scope.allStores, function (s) {
      return s.id === store.id
    })
    $scope.allStores[ i ].selected = !$scope.allStores[ i ].selected
  }

  $scope.reOrderList = function (field) {
    switch (field) {
      case 'name':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+n' ? '-name' : '+name'
        break
      case 'sku':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+s' ? '-sku_count' : '+sku_count'
        break
      case 'audio':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+a' ? '-audio' : '+audio'
        break
      case 'image':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+i' ? '-image' : '+image'
        break
      case 'status':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+s' ? '-status' : '+status'
        break
      case 'type':
        $scope.listOptions.orderBy = $scope.listOptions.orderBy.substr(0, 2) === '+p' ? '-productTypeId' : '+productTypeId'
        break
      default:
        break
    }
    refreshList()
  }

  $scope.searchProducts = function (searchText) {
    $scope.allProducts = []
    $scope.selected = []
    $scope.loadingData = true
    var selectedStores = _.filter($scope.allStores, function (st) {
      return st.selected
    })
    var options = { status: $scope.checkbox.progress, types: $scope.filter, stores: selectedStores }
    productEditorService.getProductList(searchText, options).then(function (data) {
      $scope.allProducts = data
      refreshList()
      $scope.loadingData = false
    })
  }

  var refreshList = function () {
    productEditorService.sortAndFilterProductList($scope.listOptions)
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
      $state.go('editor.match.view', { productId: product.productId })
    } else {
      $state.go('editor.view', { productId: product.productId })
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
    var options = {
      userId: $scope.userId,
      productId: product.productId,
      status: 'inprogress'
    }
    productEditorService.claim(options).then(function () {
      productEditorService.setCurrentProduct(product)
      if ($state.includes('editor.match')) {
        $state.go('editor.match.edit', { productId: product.productId })
      } else {
        $state.go('editor.edit', { productId: product.productId })
      }
    })
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
    product.status = 'done'
    productEditorService.save(product)
    $scope.viewProduct(product)
    $('.modal-backdrop').remove()
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
    var feedback = {
      issue: $scope.feedback.issue,
      comments: $scope.feedback.comments,
      date: new Date()
    }
    productEditorService.updateFeedback(feedback)
  }

  $scope.approveSelectedProducts = function () {
    productEditorService.bulkUpdateStatus($scope.selected, 'approved')
  }

  $scope.rejectSelectedProducts = function () {
    productEditorService.bulkUpdateStatus($scope.selected, 'inprogress')
  }

  $scope.approveProduct = function (product) {
    product.status = 'approved'
    productEditorService.save(product)
  }

  $scope.save = function (product) {
    product.status = 'inprogress'
    productEditorService.save(product)
  }

  $scope.updateProduct = function (product) {
    if (product.status !== 'done') {
      product.status = 'inprogress'
    }
    productEditorService.save(product)
  }

  $scope.assignSelectedToUser = function (editor) {
    $scope.selected.forEach(function (product) {
      var options = {
        username: editor.displayName || editor.username || editor.email,
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
  $(window).bind('keydown', function (event) {
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
  })

  $scope.productsSelection = {}
  $scope.productsSelection.contains = false
  // Functions related to merging //

  $scope.mergeProducts = function () {
    mergeService.merge($scope.selected).then(function () {
      if ($state.includes('editor.match')) {
        $state.go('editor.match.merge', $stateParams, { reload: true })
        $scope.selected = []
      } else {
        $state.go('editor.merge')
      }
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
    $state.go('editor.match.new')
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
})
