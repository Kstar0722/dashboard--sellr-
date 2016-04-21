angular.module('users').controller('productEditorController', function ($scope, Authentication) {
    $scope.userId = Authentication.userId || localStorage.getItem('userId')
    

});
