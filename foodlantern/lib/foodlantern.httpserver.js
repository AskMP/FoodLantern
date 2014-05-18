/*jslint nomen: true, es5: true */
/*globals require, module, console, __dirname*/
var HTTPServer,
	Q				= require('q'),
	express			= require('express'),
	engines			= require('consolidate'),
	connect			= require('connect'),
	session			= require('express-session'),
	MongoStore		= require('connect-mongo')(session),
	cookieParser	= require('cookie-parser'),
	bodyParser		= require('body-parser'),
	serveStatic		= require('serve-static'),
	http			= require('http'),
	fs				= require('fs'),
	crypto			= require('crypto');

(function () {
	"use strict";
	
	var FoodLantern = null;
	
	HTTPServer = function (settings) {
		
		var self	= this;

		this.requests	= null;
		
		this.router = null;
		
		this.Response = null;
		
		this.initialize = function () {
			var deferred = Q.defer();
			
			// Set the local private variable to the global parent module
			FoodLantern = module.parent.exports;

			// Notify the system that the initializing is taking place
			FoodLantern.notify('Initializing the HTTP Server');
			
			self.Response = require('./classes/foodlantern.response');
			
			// Use express as the primary router service
			self.router = express();
			
			// Use the Hogan templating engine (up for changing but trying it out)
			self.router.engine('html', require('hogan-express'));
						
			// There are some sites that are router specific and loaded as views
			self.router.set('views', FoodLantern.settings.htdocs + '/views');
			self.router.set('view engine', 'html');
			self.router.set('layout', FoodLantern.settings.htdocs + '/layouts/default_layout');
			
			// For some files, like the base index, there is only a static website
			self.router.use(serveStatic(FoodLantern.settings.htdocs));
			
			// Enable parsing cookies for session storage
			self.router.use(cookieParser());
			
			// Enable parsing GET and POST variables
			self.router.use(bodyParser());
			
			// Use MongoDB for session storage
			self.router.use(session({
				store: new MongoStore({
					db: FoodLantern.settings.db
				}),
				secret: FoodLantern.settings.secret
			}));
			
			// Create the request server using the router
			self.requests = http.createServer(self.router);
			
			// Listen for requests on the port number assigned in the global parent
			self.requests = self.requests.listen(FoodLantern.settings.port);
			
			deferred.resolve();
			return deferred.promise;
		};
		
		this.defaultgame = function () {
			if (Array.keys(self.games).length !== 0) {
				return self.games[Array.keys(self.games)[0]];
			} else {
				return null;
			}
		};
		
		this.beginRouter = function () {
			var deferred = Q.defer();
			
			self.router.get('/api/games/:_id?', function (request, response) {

				response = new self.Response(response);
				response._meta.request += 'games';
				if (request.params._id) {
					response._meta.request += '/' + request.params._id;
					response.result = FoodLantern.games.findById(request.params._id);
				} else {
					response.result = FoodLantern.games.listAll();
				}
				
				response.render();
			});
			
			self.router.get('/', self.primaryIndex);
			
			self.router.get('/login', self.login);
			self.router.get('/register', self.register);
			self.router.post('/login', self.loginAttempt);
			
			// Player based routers
//			self.router.get('/players/:_id', self.players.findById);
//			self.router.all('/players/login', self.players.login);
//			self.router.all('/players/register', self.players.registerNew);

			// Game based routers
//			self.router.get('/games/join/:_id', self.games.join);
//			self.router.get('/games/:_id?', self.games.findById);// (passing no _id requests list)

			// Recipe based routers
//			self.router.get('/recipes/:_id?', self.recipes.findById);// (passing no _id requests list)

			// Resource based routers
//			self.router.get('/resources/:_id?', self.resources.findById);// (passing no _id requests list)
			
			deferred.resolve();
			
			return deferred.promise;
		};
		
		this.primaryIndex = function (request, response) {

			var data = {};
			
			self.router.set('partials', {body: "documentation"});			
			response.render('documentation', data);
		};
		
		this.login = function (request, response) {

			var data = {
				loginError	: request.body.loginError,
				postTo		: 'login'
			};
			
			self.router.set('partials', {body: "login"});
			response.render('login', data);
		};
		
		this.register = function (request, response) {
			
			var data = {
				loginError	: request.body.loginError,
				postTo		: 'register'
			};
			
			self.router.set('partials', {body: "login"});
			response.render('login', data);
			
		};
		
		this.loginAttempt = function (request, response) {
			var passwordTest = crypto.createHash('sha1'),
				validMember = false;
			
			
			FoodLantern.MongoStore.models.players.findOne({ "email": request.body.email }).exec()
				.then(function (memberData) {
					if (memberData === null){
						request.body.loginError = true;
						self.login(request, response);
					} else {
						passwordTest.update(request.body.password);
						validMember = (memberData.password === passwordTest.digest('hex'));
						if (validMember) {
							delete memberData.password;
							validMember = new StepAndShare.Member(memberData);
							request.session.member = validMember;
							response.location('/dashboard');
							response.redirect('/dashboard');
						} else {
							request.body.loginError = true;
							self.login(request, response);
						}
					}
				});
			
		};
		
		this.registerAttempt = function () {
			
		};
	};
	
	HTTPServer = new HTTPServer();
	
}());

module.exports = HTTPServer;