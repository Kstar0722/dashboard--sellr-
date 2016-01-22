'use strict';

//Suppliers service used to communicate Suppliers REST endpoints
angular.module('suppliers').factory('Suppliers', ['$resource',
	function($resource) {
		return $resource('suppliers/:supplierId', { supplierId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);