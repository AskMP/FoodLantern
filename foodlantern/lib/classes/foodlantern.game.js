var Game,
	Q = require('q');

(function () {
	"use strict";
	
	var FoodLantern;
	
	Game = function (gameData) {
		
		var self = this;
		
		this._id		= '';
		this.name		= '';
		this.speed		= 1;
		this.distance	= 1;
		this.date_start	= 0;
		this.date_end	= 0;
		this.lanterns	= [];
		this.recipes	= [];
		this.players	= [];
		this.status		= 1;
		this.geofence	= {
			longitude	: 0,
			latitude	: 0,
			radius		: 0
		};
		
		this.initialize = function (gameData) {
			gameData = gameData || {};
			var d;
			
			FoodLantern = module.parent.parent.exports;
			
			gameData = JSON.parse(JSON.stringify(gameData));
			
//			self._lanterns	= require('../models/foodlantern.lanterns');
//			self.players	= require('../methods/foodlantern.players');
			for (d in gameData) {
				if (gameData.hasOwnProperty(d) && self.hasOwnProperty(d)) {
					self[d] = gameData[d];
				}
			}
			
			return self;
		};
		
		this.loadLanterns = function () {
			var deferred = Q.defer();

			FoodLantern.MongoServer.lantern.find({game_id: self._id}).exec()
				.then(function (err, lanterns) {
					var i;
					if (err) {
						deferred.reject(err);
					} else {

						for (i = 0; i < lanterns.length; i += 1) {
							self.lanterns.add(lanterns[i]);
						}
						
						deferred.resolve();
					}
				}, console.log);
			
			return deferred.promise;
		};
		
		this.save = function () {
			var deferred = Q.defer(),
				newData = {
				name		: self.name,			// Name of the game or special event
				speed		: self.speed,			// The speed modifier in which to use for the resource collection (default: 1)
				distance	: self.distance,		// Distance modifier for resource capturing (default: 1)
				date_start	: self.date_start,		// UTC of the start time (10 digit)
				date_end	: self.date_end,		// UTC of the end time (10 digit)
				geofence	: {
					longitude	: self.geofence.longitude,	// Location identifier
					latitude	: self.geofence.latitude,	// Location identifier
					radius		: self.geofence.radius		// Location identifier
				},
				lanterns	: self.lanterns,		// Array of unique lantern MongoDB _id strings
				recipes		: self.recipes,		// Array of unique recipe MongoDB _id strings
				players		: self.players,		// Array of unique player MongoDB _id strings (on-going)
				status		: self.status		// Whether the game is active or inactive
			};
			
			if (self._id === '') {
				FoodLantern.MongoServer.models.game.create(newData, function (err, newGame) {
					if (err) {
						console.log(err);
					} else {
						self._id = newGame._id;
					}
					
					deferred.resolve();
					
				});
			} else {
				FoodLantern.MongoServer.models.game.update({_id: self._id}, newData).exec()
					.then(function (err, numberAffected, raw) {
						deferred.resolve();
					}, console.log);
			}
			
			return deferred.promise;
			
		};

		this.initialize(gameData);
		
	};
	
	module.parent.parent.exports.MongoServer.addSchema('game', {
		name		: String,		// Name of the game or special event
		speed		: Number,		// The speed modifier in which to use for the resource collection (default: 1)
		distance	: Number,		// Distance modifier for resource capturing (default: 1)
		date_start	: Number,		// UTC of the start time (10 digit)
		date_end	: Number,		// UTC of the end time (10 digit)
		geofence	: {
			longitude	: Number,		// Location identifier
			latitude	: Number,		// Location identifier
			radius		: Number		// Location identifier
		},
		lanterns	: [String],		// Array of unique lantern MongoDB _id strings
		recipes		: [String],		// Array of unique recipe MongoDB _id strings
		players		: [String],		// Array of unique player MongoDB _id strings (on-going)
		status		: Number		// Whether the game is active or inactive
	});
	
}());

module.exports = Game;