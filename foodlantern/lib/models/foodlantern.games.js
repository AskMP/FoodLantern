var games,
	Q = require('q');
	
(function () {
	"use strict";
	
	var FoodLantern = null;
	
	games = function () {
		
		var self = this;
		
		this.Game = require('../classes/foodlantern.game');
		
		this.games = [];
		
		this.initialize = function () {
			FoodLantern = module.parent.exports;
		};
		
		this.listAll = function () {
			return self.games;
		};
		
		this.add = function (gameData) {
			var deferred = Q.defer();

			self.games.push(new self.Game(gameData));

			deferred.resolve();
			return deferred.promise;
		};
		
		this.addAll = function (games, index) {
			var deferred = Q.defer();
			
			games = games || [];
			index = index || 0;
				
			if (index === games.length) {
				deferred.resolve();
			} else {
				self.add(games[index])
					.then(function () {
						index += 1;
						return self.addAll(games, index);
					}, console.log);
			}
			
			return deferred.promise;
		};
		
		this.findById = function  (request_id) {
			var result = [],
				i;

			request_id = request_id.toString().split(',');
			
			for (i = 0; i < self.games.length; i += 1) {
				if (request_id.indexOf(self.games[i]._id) >= 0) {
					result.push(self.games[i]);
				}
			}
			
			return result;
		};
		
		this.findByDateRange = function (startDate, endDate) {
			var deferred = Q.defer();
			
			startDate	= startDate	|| new Date('2014-01-01').valueOf() / 1000;
			endDate		= endDate	|| new Date('2015-01-01').valueOf() / 1000;
			
			FoodLantern.MongoServer.models.game.find()
				.where('date_start').lte(endDate)
				.where('date_end').gte(startDate)
				.exec()
				.then(function (games) {
					games = games || [];
					deferred.resolve(games);
				});
			
			return deferred.promise;
		};
		
		this.newGame = function (gameData) {
			var game, deferred = Q.defer();

			game = new self.Game(gameData);
			
			if (game._id === '') {
				game.save()
					.then(function () {
						self.games.push(game);
						game.loadLanterns()
							.then(function () {
								deferred.resolve();
							}, console.log)
					}, console.log);
			}
			
			return deferred.promise;
		};
		
		this.capture = function (request, res) {
			var deferred = Q.defer();
			
			
			return deferred.promise;
		};
		
		this.initialize();
		
	};
	
	games = new games();
	
}());

module.exports = games;