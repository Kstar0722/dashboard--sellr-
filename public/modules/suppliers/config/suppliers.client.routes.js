'use strict';

//Setting up route
angular.module('suppliers').config(['$stateProvider',
	function($stateProvider) {
		// Suppliers state routing
		$stateProvider.
		state('listSuppliers', {
			url: '/suppliers',
			templateUrl: 'modules/suppliers/views/list-suppliers.client.view.html'
		}).
		state('createSupplier', {
			url: '/suppliers/create',
			templateUrl: 'modules/suppliers/views/create-supplier.client.view.html'
		}).
		state('viewSupplier', {
			url: '/suppliers/:supplierId',
			templateUrl: 'modules/suppliers/views/view-supplier.client.view.html'
		}).
		state('editSupplier', {
			url: '/suppliers/:supplierId/edit',
			templateUrl: 'modules/suppliers/views/edit-supplier.client.view.html'
		});
	}
]);