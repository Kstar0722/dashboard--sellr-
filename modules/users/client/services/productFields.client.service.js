angular.module('users').factory('productFields', function () {
    var me = this;

    me.wine = [
        {field: 'id'},
        {field: 'description'},
        {field: 'name'},
        {field: 'winery'},
        {field: 'appellation'},
        {field: 'description'},
        {field: 'country'},
        {field: 'region'},
        {field: 'size'},
        {field: 'varietal'},
        {field: 'vintage'}
    ];
    me.beer = [
        {field: 'id', enableCellEdit: false, width: '10%'},
        {field: 'description'},
        {field: 'name'},
        {field: 'appellation'},
        {field: 'brew'},
        {field: 'brewery'},
        {field: 'type'},
        {field: 'abv', name: 'ABV %'},
        {field: 'style'},
        {field: 'country'},
        {field: 'vintage'},
        {field: 'packaging'},
        {field: 'size'}
    ];
    me.spirits = [
        {field: 'id', enableCellEdit: false, width: '10%'},
        {field: 'skus'},
        {field: 'description'},

    ];
    me.generic = [
        {field: 'id', enableCellEdit: false, width: '10%'},
        {field: 'name'},
        {field: 'brewery', name: 'Manufacturer - beer'},
        {field: 'winery', name: 'Manufacturer - winery'},
        {field: 'distillery', name: 'Manufacturer - spirits'},
        {field: 'description'}


    ];


    return me;
});/**
 * Created by mac4rpalmer on 6/27/16.
 */
