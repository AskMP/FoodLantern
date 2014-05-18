var MongoServer,
	mongoose = require('mongoose'),
	Q = require('q');

(function (){
	"use strict";
	
	var FoodLantern;
	
	MongoServer = function () {
		
		var self = this;
		
		this.schemas = {};
		this.models = {};
		
		this.connection = null;
		
		this.initialize = function () {
			var deferred = Q.defer();
			
			// Set the local private variable to the global parent module
			FoodLantern = module.parent.exports;
			
			// Notify the system that the initializing is taking place
			FoodLantern.notify('Initializing the MongoDB Server');
			
			self.connection = mongoose.connect('mongodb://localhost/' + FoodLantern.settings.db);
			
			deferred.resolve();
			
			return deferred.promise;
			
		};
		
		this.addSchema = function (schemaName, schemaStructure) {
			var deferred = Q.defer();
			self.schemas[schemaName] = new mongoose.Schema(schemaStructure);
			self.models[schemaName] = mongoose.model(schemaName, self.schemas[schemaName]);
			
			deferred.resolve();
			return deferred.promise;
		};
		
	};
	
	MongoServer = new MongoServer();
	
}());

module.exports = MongoServer;