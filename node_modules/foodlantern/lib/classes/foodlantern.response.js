var Response;

(function () {
	"use strict";
	
	Response = function (routerResponse) {
		
		var self = this,
			_response;
	
		// Base meta information about the request
		this._meta = {
			datetime: null,	// UTC timecode of the request
			duration: null,	// Duration of the request in millliseconds
			request: '/'
		};

		this.result = [];
		
		this.initialize = function (routerResponse) {
			
			// No response variables will result in an error
			if (!routerResponse) {
				console.error('Invalid router response.');
			}
			
			// set the provate response variable to the router response for future use
			_response = routerResponse;
			
			// Seems backwards but will allow for less math required and object creation
			self._meta.duration = new Date().valueOf();
			
			// Datetime doesn’t need milliseconds
			self._meta.datetime = Math.round(self._meta.duration / 100);
		};
		
		this.render = function () {
			
			// Convert duration of the request to millisecond integer timeframe
			self._meta.duration = new Date().valueOf() - self._meta.duration;
			
			// write the header as JSON
			_response.type('application/json');
			
			// Write the response as a JSON string
			_response.send(JSON.stringify(self));

		};
		
		this.errorResponse = function (errorStr, errorCode) {
			
			// Convert duration of the request to millisecond integer timeframe
			self._meta.duration = (new Date().valueOf() - self._meta.duration);
			
			// Change the response to be an error;
			self.response = { error : errorStr, code: errorCode };
			
			// write the header as JSON
			_response.type('application/json');
			
			// Write the response as a JSON string
			_response.send(JSON.stringify(self));
			
			
		};

		// When a response is created, capture the HTTP response		
		this.initialize(routerResponse);
		
	};
	
	
}());

module.exports = Response;