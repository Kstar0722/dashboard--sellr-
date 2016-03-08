angular.module('users').service('locationsService', function ($http, constants, toastr, $q) {
    var me = this;

    me.init = function () {
        var defer = $q.defer();
        me.locations = [];
        me.accountId = localStorage.getItem('accountId');
        me.editLocation = {};
        me.getLocations();

        defer.resolve();
        return defer.promise;
    };


    //MAIN CRUD OPERATIONS, Create, Get, Update, Delete

    me.createLocation = function (location) {
        var url = constants.API_URL + '/locations';
        var payload = {
            payload: location
        };
        debugger;
        $http.post(url, payload).then(onCreateLocationSuccess, onCreateLocationFail)
    };


    me.getLocations = function () {
        me.locations = [];

        var url = constants.API_URL + '/locations?account=' + me.accountId;
        return $http.get(url).then(function (res) {
            console.log('locationsService getLocations %O', res);
            me.locations = res.data
        })
    };


    me.updateLocation = function () {
        var url = constants.API_URL + '/locations/' + me.editLocation.locationId;
        var payload = {
            payload: me.editLocation
        };
        $http.put(url, payload).then(onUpdateLocationSuccess, onUpdateLocationFail)

    };


    me.deleteLocation = function (location) {
        var url = constants.API_URL + '/locations/' + location.locationId;
        if (location.name.includes('default_')) {
            toastr.error('Cannot delete the default location!', "I'm afraid I can't do that.");
            return
        } else {
            $http.delete(url).then(onDeleteSuccess, onDeleteFail)
        }
    };


    //API RESPONSE/ERROR HANDLING

    function onCreateLocationSuccess(res) {
        if (res.statusCode == 200) {
            toastr.success('New Location Created', 'Success!')
        }
    }

    function onCreateLocationFail(err) {
        console.error(err);
        toastr.error('Could not create new location.')
    }

    function onUpdateLocationSuccess(res) {
        if (res.statusCode == 200) {
            toastr.success('Location Updated', 'Success!')
        }
    }

    function onUpdateLocationFail(err) {
        console.error(err);
        toastr.error('Could not update location.')
    }

    function onDeleteSuccess(res) {
        if (res.statusCode == 200) {
            toastr.success('Location deleted', 'Success!')
        }
    }

    function onDeleteFail(err) {
        console.error(err);
        toastr.error('Could not delete location.')
    }


    return me;
});
