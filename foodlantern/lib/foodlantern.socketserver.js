/*jslint nomen: true, es5: true */
/*globals require, module, console, __dirname*/
var SocketServer,				// The local object
	io = require('socket.io'),
	Q = require('q');

(function () {
	"use strict";
	
	var FoodLantern; // Global object assigned to the prime
	
	SocketServer = function () {
		
		// Self referencing for child methods
		var self	= this;
		
		// Setup the socketIO variable
		this.io		= null;
		
		/***
		 * Initialization (Prime Object)
		 *	Connects the prime object to the global variable
		 *	Returns a promise and the prime global object
		 */
		this.initialize = function () {
			var deferred = Q.defer();
			
			// Set the local private variable to the global parent module
			FoodLantern = module.parent.exports;
			
			// Notify the system that the initializing is taking place
			FoodLantern.notify('Initializing the Socket Server');
			
			self.beginSocketServer()
				.then(function (){
					deferred.resolve();
				});
			
			return deferred.promise;
		};
		
		/***
		 * Begin the Socket Server listener
		 */
		this.beginSocketServer = function () {
			var deferred = Q.defer();
			
			// Only set if the socket server has not been set yet
			if (self.io === null) {

				// Use the prime object's HTTP server for the listener to ensure no conflicts
				self.io = io.listen(FoodLantern.HTTPServer.requests, { log: FoodLantern.settings.debug });

			}
			
			deferred.resolve();
			
			return deferred.promise;
		};
		
		/***
		 * Setup the Socket.io Server Listeners
		 */
		this.setupServerListeners = function () {
			var deferred = Q.defer();
			
			// Any new connection to the server, greet the connection
			self.io.on('connection', self.greetNewConnection);
			
			deferred.resolve();
			
			return deferred.promise;
		};
		
		/***
		 * Greet Any New Connection
		 *	@param	socket	socket.io connection
		 */
		this.greetNewConnection = function (socket) {
			
			// Offer up a handshake for the new connection
			socket.emit('handshake', {hello : 'greetings stranger'});
			
			// Listen to see if the handshare was returned
			socket.on('handshake', function (ident) {
			
				// Identify the connection based upon their handshake
				self.socketIdentification(socket, ident);

			});
			
		};
		
		/***
		 * Identify the Socket
		 *	@param	socket			socket.io connection
		 *	@param	identification	handshake data
		 */
		this.socketIdentification = function (socket, identification) {

			// Using the supplied roll, assume the socket's connection type
			switch (identification.roll) {

			// Players are the most common type and will need to be created in far
			// more depth later. For now, we're just storing the current socket data
			// as the item but will eventually be a javascript object
			case 'player':
				// Add a new player to the prime's player list
				self.addNewPlayer(socket)
				// There is a common list of listeners that all connections have
					.then(self.addCommonListeners)
				// Append the player specific listeners to ensure that there is no crossover for admins
					.then(self.addPlayerListeners)
				// Notify the administrators that a new player has connected
					.then(function (player) {
						self.notifyAdmins('newPlayer', {
							id: socket.id
						});
						socket.emit('welcome', {
							id: player.id,
							resources: player.resources,
							score: player.score
						});
					})
				// [insert final fantasy win music here]
					.done();
				break;
				
			// Administrators are rare but will allow for monitoring and creating new
			// lanterns. There really should be a password or some form of security
			// that is used here but that has yet been built
			case 'admin':
				// Add a new administrator to the prime's admin list
				self.addAdministrator(socket)
				// There is a common list of listeners that all connections have
					.then(self.addCommonListeners)
				// Append the administrator specific listeners to the socket connection
					.then(self.addAdministratorListeners)
				// Notify the administrators that there is a new admin
					.then(function (admin) {
						self.notifyAdmins('newAdmin', {
							id: socket.id
						});
						
						socket.emit('welcome', {
							id: admin.id
						});
						socket.emit('players', FoodLantern.playerList());
						socket.emit('lanterns', FoodLantern.lanternList());
						socket.emit('administrators', FoodLantern.adminList());
					})
				// [insert final fantasy win music here]
					.done();
				break;
			}
		};
		
		/***
		 * Nofity Administrators
		 *	@param	notificationType	string value of the notification name
		 *	@param	notificationData	javascript object or array of the data to pass
		 */
		this.notifyAdmins = function (notificationType, notificationData) {
			self.io.sockets.in('admins').emit(notificationType, notificationData);
			return true;
		};
		
		/***
		 * Append the New Player
		 *	@param	socket			socket.io connection
		 *	@return	socket
		 */
		this.addNewPlayer = function (socket) {
			var deferred = Q.defer();
			
			// Ensure that the player is not duplicated already
			if (!FoodLantern.players[socket.id]) {
				// Set the player to the prime's player list using it's ID as an index
				FoodLantern.players[socket.id] = new FoodLantern.Player(socket, 'socket');
				deferred.resolve(FoodLantern.players[socket.id]);
			} else {
				deferred.reject();
			}
			
			return deferred.promise;
			
		};
		
		/***
		 * Append the New Administrator
		 *	@param	socket			socket.io connection
		 *	@return	socket
		 */
		this.addAdministrator = function (socket) {
			var deferred = Q.defer();
			
			FoodLantern.admins[socket.id] = new FoodLantern.Administrator(socket);

			deferred.resolve(FoodLantern.admins[socket.id]);
			
			return deferred.promise;
		};
		
		/***
		 * Add the Common Listeners to the Socket
		 *	@param	socket			socket.io connection
		 *	@return	socket
		 */
		this.addCommonListeners = function (connectedUser) {
			var deferred = Q.defer(),
				thisSocket = connectedUser.socket;	// Create a new socket reference for identifying the socket in removals
			connectedUser.socket.on('disconnect', function () {
				self.notifyAdmins('removePlayer', {
					id: thisSocket.id
				});
				self.disconnectSocket(thisSocket);
			});
			
			deferred.resolve(connectedUser);
			
			return deferred.promise;

		};
		
		/***
		 * Add the Player Listeners to the Socket
		 *	@param	socket			socket.io connection
		 *	@return	socket
		 */
		this.addPlayerListeners = function (player) {
			var deferred = Q.defer();
			
			// Join the player room
			player.socket.join('players');
			
			deferred.resolve(player);
			
			return deferred.promise;
		};
		
		/***
		 * Add the Adminsitrator Listeners to the Socket
		 *	@param	socket			socket.io connection
		 *	@return	socket
		 */
		this.addAdministratorListeners = function (admin) {
			var deferred = Q.defer();
			
			admin.socket.join('admins');
			admin.socket.on('playerList', function () {
				admin.socket.emit('players', FoodLantern.playerList());
			});
			admin.socket.on('lanternList', function () {
				admin.socket.emit('lanterns', FoodLantern.lanternList());
			});
			admin.socket.on('administratorList', function () {
				admin.socket.emit('administrators', FoodLantern.adminList());
			});
			
			deferred.resolve(admin);
			
			return deferred.promise;
		};
		
		this.confirmAdministrator = function (admin) {
			var deferred = Q.defer();
			
			return deferred.promise;
		};
		
		/***
		 * Disconnect the Socket gracefully
		 *	@param	socket			socket.io connection
		 */
		this.disconnectSocket = function (socket) {

			// Remove from the player list and room
			if (FoodLantern.players[socket.id]) {
				socket.leave('players');
				delete FoodLantern.players[socket.id];
			}
			
			// Remove from the admin list and room
			if (FoodLantern.admins[socket.id]) {
				socket.leave('admins');
				delete FoodLantern.admins[socket.id];
			}

		};
	};
	
	// Create a new object as the returning variable
	SocketServer = new SocketServer();
	
}());

// Set the export to the variable so you don't create it again during run-time
module.exports = SocketServer;