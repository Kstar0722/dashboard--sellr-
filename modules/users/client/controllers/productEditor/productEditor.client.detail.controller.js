angular.module('core').controller('productEditorDetailController', function ($scope, Authentication, productEditorService, $location, $state, $stateParams, type, status) {
  $scope.userId = Authentication.userId || localStorage.getItem('userId')

    // $scope.permissions.editor = JSON.parse(localStorage.getItem('roles')).indexOf(1010) > -1;
    // $scope.permissions.curator = JSON.parse(localStorage.getItem('roles')).indexOf(1011) > -1;
  $scope.permissions = {
    editor: Authentication.user.roles.indexOf('editor') > -1,
    curator: Authentication.user.roles.indexOf('curator') > -1
  }
  console.log('state params %O', type, status)

  console.log('starting product detail controller')
  $scope.productEditorService = productEditorService
})
