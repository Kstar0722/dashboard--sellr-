angular.module('users.manager').controller('LocationManagerController', function ($scope, locationsService, $state, accountsService, CurrentUserService) {
    locationsService.init().then(function () {
        $scope.locationsService = locationsService;
        $scope.location = {};
        $scope.accountsService = accountsService;
        $scope.currentUserService = CurrentUserService;
    });


    //changes the view, and sets current edit location
    $scope.editLocation = function (location) {
        locationsService.editLocation = location;
        console.log('editLocation %O', locationsService.editLocation);
        $state.go('manager.locations.edit', {id: location.locationId})
    }

});
