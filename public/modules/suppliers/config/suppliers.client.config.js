'use strict';

// Configuring the Articles module
angular.module('suppliers').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Suppliers', 'suppliers', 'dropdown', '/suppliers(/create)?');
		Menus.addSubMenuItem('topbar', 'suppliers', 'List Suppliers', 'suppliers');
		Menus.addSubMenuItem('topbar', 'suppliers', 'New Supplier', 'suppliers/create');
	}
]);