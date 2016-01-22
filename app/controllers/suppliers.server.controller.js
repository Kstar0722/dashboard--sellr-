'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Supplier = mongoose.model('Supplier'),
	_ = require('lodash');

/**
 * Create a Supplier
 */
exports.create = function(req, res) {
	var supplier = new Supplier(req.body);
	supplier.user = req.user;

	supplier.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(supplier);
		}
	});
};

/**
 * Show the current Supplier
 */
exports.read = function(req, res) {
	res.jsonp(req.supplier);
};

/**
 * Update a Supplier
 */
exports.update = function(req, res) {
	var supplier = req.supplier ;

	supplier = _.extend(supplier , req.body);

	supplier.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(supplier);
		}
	});
};

/**
 * Delete an Supplier
 */
exports.delete = function(req, res) {
	var supplier = req.supplier ;

	supplier.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(supplier);
		}
	});
};

/**
 * List of Suppliers
 */
exports.list = function(req, res) { 
	Supplier.find().sort('-created').populate('user', 'displayName').exec(function(err, suppliers) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(suppliers);
		}
	});
};

/**
 * Supplier middleware
 */
exports.supplierByID = function(req, res, next, id) { 
	Supplier.findById(id).populate('user', 'displayName').exec(function(err, supplier) {
		if (err) return next(err);
		if (! supplier) return next(new Error('Failed to load Supplier ' + id));
		req.supplier = supplier ;
		next();
	});
};

/**
 * Supplier authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.supplier.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
