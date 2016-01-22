'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var suppliers = require('../../app/controllers/suppliers.server.controller');

	// Suppliers Routes
	app.route('/suppliers')
		.get(suppliers.list)
		.post(users.requiresLogin, suppliers.create);

	app.route('/suppliers/:supplierId')
		.get(suppliers.read)
		.put(users.requiresLogin, suppliers.hasAuthorization, suppliers.update)
		.delete(users.requiresLogin, suppliers.hasAuthorization, suppliers.delete);

	// Finish by binding the Supplier middleware
	app.param('supplierId', suppliers.supplierByID);
};
