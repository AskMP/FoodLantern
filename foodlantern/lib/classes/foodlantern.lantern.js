/*jslint nomen: true */
/*globals require, module, console*/
var Lantern,
	Q = require('q');

(function () {
	"use strict";
	
	var FoodLantern;
	
	Lantern = function (lanternData) {
	
		data = data || {};
		
		var self = this;

		this._id			= '';
		this.game_id		= '';
		this.uid			= '';
		this.name			= '';
		this.description	= '';
		this.notation		= '';
		this.status			= 1;
		this.occupant		= '';
		this.resources		= [];
		this.geolocation	= {
			longitude	: Number,
			latitude	: Number
		};
		
		this.initialize = function (lanternData) {
			lanternData = lanternData || {};

			var d;
			
			FoodLantern = module.parent.exports;
			
			if (!FoodLantern.MongoServer.schemas.lantern) {
				self.initializeModel();
			}
			
			for (d in data) {
				if (self.hasOwnProperty(d) && data.hasOwnProperty(d)) {
					self[d] = data[d];
				}
			}

		};
		
		this.initializeModel = function () {
			FoodLantern.MongoServer.addSchema('lantern', {
				game_id		: String,		// The game the lantern is associated to
				uid			: String,		// Device unique identifier
				name		: String,		// Name given to device (for within app)
				description	: String,		// Description of the lantern
				notation	: String,		// Any tip that is associated to it such as location
				status		: Number,		// Current status of the lantern (occupied, available, disabled, etc…)
				occupant	: String,		// unique player MongoDB _id string or empty
				resources	: [{
					_id			: String,
					name		: String,		// Name of the resouce (common)
					description	: String,		// Description of the resource (common)
					special		: String,		// Any special effects that are associated to the resource
					distance	: Number,		// The distance players must be to capture
					type		: Number,		// Type of acquisition of the resource (%, quantity, single, etc…)
					maximum		: Number,		// Maximum available at the given lantern
					current		: Number,		// Current available at the given lantern
					regeneration: Number		// The speed in which the resource regenerates per minute
				}],
				geolocation	: {
					longitude	: Number,		// Location identifier
					latitude	: Number		// Location identifier
				}
			});
		};
		
		this.initialize(lanternData);
	};
	
}());

module.exports = Lantern;