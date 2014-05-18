
var FoodLantern = {},
	Q = require('q');

(function () {
	"use strict";
	
	FoodLantern = function () {
		
		var self = this;
		
		this.HTTPServer		= null;
		this.SocketServer	= null;
		this.MongoServer	= null;
		
		this.games		= null;
		this.players	= null;

		// Various shared settings for all the application endpoints
		this.settings	= {
			port     : 8080,	// Non-conflicting with the standard 80
			debug	 : true,	// Whether to show console data
			speed    : 1,
			db		 : 'FoodLantern',	// MongoDB database name
			secret	 : 'h8trg0nn4h8',	// Session secret
			htdocs   : __dirname + '/../htdocs'	// The root directory of the htdocs
		};
		
		// This is 
		this.initialize = function (settings) {
			var i, deferred = Q.defer();
			settings = settings || {};
			for (i in settings) {
				if (settings.hasOwnProperty(i)) {
					self.settings[i] = settings[i];
				}
			}
			
			// Start by setting up the database connection to MongoDB
			// This is setup first due to session data being required for the HTTP server setup
			self.MongoServer.initialize()
				// Initialize the HTTP server for all server communication
				.then(self.HTTPServer.initialize, console.log)
				// Setup the Socket.io server for any standard clients
				.then(self.SocketServer.initialize, console.log)
				// Begin the HTTP Side of things for GET and POST communication
				.then(self.HTTPServer.beginRouter, console.log)
				// Setup the event listeners for the Socket Server
				.then(self.SocketServer.beginListeners, console.log)
				// Setup the models
				.then(self.loadModels, console.log)
				// Begin any games that are supposed to be active
				.then(self.loadGames, console.log)
				.then(function () {
					deferred.resolve();	
				}, console.log);
			
			return deferred.promise;
		};
		
		// Only notify the console if the debug mode is enabled.
		this.notify = function (message) {
			if (!!self.settings.debug) {
				console.log(message);
			}
		};
		
		this.loadModels = function () {
			var deferred = Q.defer();
			self.notify('Loading Models');
			self.games = require('./models/foodlantern.games');
			self.players = require('./models/foodlantern.players');
			
			deferred.resolve();
			
			return deferred.promise;
		}
		
		this.loadGames = function () {
			var deferred = Q.defer();
			self.notify('Loading existing games');
			self.games.findByDateRange()
				.then(function (games) {
					self.games.addAll(games)
						.then(function () {
							if (self.games.listAll().length === 0) {
								self.games.newGame({
										name: 'Default',
									    speed: 1,
									    distance: 1,
									    date_start: 1398902400,
									    date_end: 1419984000,
									    status: 1,
									    players: [],
									    recipes: [],
									    lanterns: [],
									    geofence: {
									    	latitude: 43.652698,
									    	longitude: -79.401336,
									    	radius: 0.2
									    }
								})
								.then(function () {
									deferred.resolve();
								});
							} else {
								deferred.resolve();
							}
						}, console.log);
				}, console.log);
			
				
			return deferred.promise;
		};
		
		this.isArray = function (it) {
			return Object.prototype.toString.call(it) === '[object Function]';
		};
		
		this.isFunction = function (it) {
			return Object.prototype.toString.call(it) === '[object Array]';
		};
		
	};
	
	// Create the single object class as it’s own variable
	FoodLantern = new FoodLantern();

	// Load the response class as it will be used for any API request structure
	FoodLantern.Response		= require('./classes/foodlantern.response');
	
	// Load the HTTP server as a pre-made variable, there is no need to use "new"
	FoodLantern.HTTPServer		= require('./foodlantern.httpserver');
	
	// Load the Socket server as a pre-made variable, there is no need to use "new"
	FoodLantern.SocketServer	= require('./foodlantern.socketserver');
	
	// Load the Mongo server as a pre-made variable, there is no need to use "new"
	FoodLantern.MongoServer		= require('./foodlantern.mongoserver');
	
}());

// Set the export to be only the global object
module.exports = FoodLantern;