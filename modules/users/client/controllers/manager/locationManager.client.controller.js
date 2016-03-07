angular.module('users.manager').controller('LocationManagerController', function ($scope, locationsService) {

    $scope.account = localStorage.getItem('accountId');

    locationsService.getLocations($scope.account)

});
