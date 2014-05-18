/*jslint nomen: true */
/*globals require, module, console*/
var Administrator,
	Q = require('q');

(function () {
	"use strict";
	
	var FoodLantern; // Global object assigned to the prime
	
	Administrator = function (connection) {
		
		var self = this;
		
		this.socket = null;
		
		this.id = null;
		this._id = null;
		
		this.email = false;
		
		this.initialize = function (adminData) {
			
			FoodLantern = module.parent.exports.FoodLantern;
			
			self.socket = adminData;
			self.id = adminData.id;
			return self;
			
		};
		
		return this.initialize(connection);
		
	};
	
}());

module.exports = Administrator;