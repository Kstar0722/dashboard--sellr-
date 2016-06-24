angular.module('users').controller('productEditorMergeController', function ($scope, Authentication, productEditorService, $location, $state, $stateParams, Countries, $mdMenu, constants, MediumS3ImageUploader) {

    Authentication.user = Authentication.user || { roles: '' };
    $scope.$state = $state;
    $scope.pes = productEditorService;
    // $scope.userId = Authentication.userId || localStorage.getItem('userId') || 407;
    $scope.userId = localStorage.getItem('userId');

    $scope.permissions = {
        editor: Authentication.user.roles.indexOf(1010) > -1 || Authentication.user.roles.indexOf(1004) > -1,
        curator: Authentication.user.roles.indexOf(1011) > -1 || Authentication.user.roles.indexOf(1004) > -1
    };





});
