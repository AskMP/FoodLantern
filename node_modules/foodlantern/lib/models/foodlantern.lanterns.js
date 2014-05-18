var lanterns,
	Q = require('q');
	
(function () {
	"use strict";
	
	var FoodLantern = null;
	
	lanterns = function () {
		
		var self = this;
		
		this.lanterns = [];
		this.Lantern = require('../classes/foodlantern.lantern');
		
		this.listAll = function (request, res) {
			var deferred = Q.defer();
			
			deferred.resolve(self.lanterns);
			
			return deferred.promise;
		};
		
		this.add = function (lanternData) {
			var deferred = Q.defer();

			this.lanterns.push(new self.Lantern(lanternData));

			deferred.resolve();
			return deferred.promise;
		};
		
		this.findById = function  (request_id) {
			var deferred = Q.defer();
			
			deferred.resolve();
			return deferred.promise;
		};
		
		this.findByResource = function (resource_id) {
			resource_id = resource_id.split(',');
			var deferred = Q.defer(),
				i, r, result = [];
			for (i = 0; i < self.lanterns; i += 1) {
				for (r = 0; r < self.lanterns[i].resources[r].length; r += 1) {
					if (resource_id.indexOf(self.lanterns[i].resources[r]._id)) {
						result.push(self.lanterns[i]);
						break;
					}
				}
			}
			
			deferred.resolve(result);
			
			return deferred.promise;
		};
		
		this.findByRange = function (request, res) {
			var deferred = Q.defer();
			
			
			return deferred.promise;
		};
		
		this.capture = function (request, res) {
			var deferred = Q.defer();
			
			
			return deferred.promise;
		};
		
	};
	
	lanterns = new lanterns();
	
}());

module.exports = lanterns;