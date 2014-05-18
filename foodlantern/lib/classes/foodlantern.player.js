/*jslint nomen: true */
/*globals require, module, console*/
var Player,
	Q = require('q');

(function () {
	"use strict";
	
	var FoodLantern; // Global object assigned to the prime
	
	Player = function (playerData, type) {
	
		type = type || 'http';
		
		var self		= this,
			socket		= null,
			socketID	= null;
		
		this._id			= "";
		this.given_name		= "";
		this.family_name	= "";
		this.email			= "";
		this.password		= "";
		this.status			= 1;
		this.is_admin		= 0;
		this.resources		= [];
		
		this.initialize = function (playerData, type) {
			
			FoodLantern = module.parent.parent.exports.FoodLantern;
		
			switch (self._connectionType) {
			case 'socket':
				socket = playerData;
				break;
			}
			
			return self;
		};
		
		return this.initialize(playerData, type);
		
	};
	
	module.parent.parent.exports.MongoServer.addSchema('player', {
		given_name		: String,
		family_name		: String,
		email			: String,
		password		: String,
		status			: Number,
		is_admin		: Number,
		score			: Number,
		resources		: [String]
	});
	
}());

module.exports = Player;