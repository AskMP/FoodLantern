var players,
	Q = require('q');
	
(function () {
	"use strict";
	
	var FoodLantern = null
	
	players = function () {
		
		var self = this;
		
		this.Player = require('../classes/foodlantern.player');
		
		this.initialize = function () {
			FoodLantern = module.parent.exports;
		};
		
	};
	
	
	
}());