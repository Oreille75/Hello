var _CONFIG    = require('./config');
var _UTILS     = require('./utils');

var bodyParser = require('body-parser');
var express    = require('express');
var app        = express();
var http       = require('http');
var https      = require('https');
var server     = http.createServer(app).listen(8080);
var redis      = require('redis');
var ws         = require('ws').Server;

var twitter    = require('twitter');
var instagram  = require('instagram-node-lib'); 

var App = {

	config: {
		hashtag: "kinlight",
		twitter: true,
		instagram: true,
		timers: {
			title: 5,
			feed: 20,
			zoom: 10,
			winner: 10
		},
		rocket: true,
		manual: false,
		force: 1
	},

	init: function init() {
		var self = this;

		// Initializing Web Socket server
		_UTILS.debug('[WS] WebSocket server is online!');
		this.server = new ws({port: _CONFIG._PORT});
		this.server.on('connection', function(wss) {
			wss.on('message', function(message) {
				message = JSON.parse(message);
				_UTILS.debug('[RECEIVED]', message);

				switch(message.request) {
					case 'config':
						self.api('config', self.config);
						break;
					case 'modifyConfig':
						self.modifyConfig(message.params);
						break;
					case 'getStored':
						self.getStored(function(data) {
							self.api('stored', data, false, true, wss);
						});
						break;
					case 'getModerated':
						self.getModerated(function(data) {
							self.api('moderated', data, false, true, wss);
						});
						break;
					case 'validate':
					case 'deny':
					case 'fav':
					case 'rocket':
					case 'winner':
						self.action(message.request, message.params);
						break;
					case 'rerocket':
						self.rerocket(message.params);
						break;
					case 'rewinner':
						self.rerocket(message.params, true);
						break;
					case 'resetfeed':
						self.api('resetfeed', {});
						break;
				}
			});
		});
		this.server.broadcast = function(data) {
		    for (var i in this.clients) {
		    	this.clients[i].send(data);
		    }
		};


		// Initializing Twitter Object
		this.twitr = new twitter({
		    consumer_key: _CONFIG._TWITTER_TOKEN,
		    consumer_secret: _CONFIG._TWITTER_SECRET,
		    access_token_key: _CONFIG._TWITTER_UTOKEN,
		    access_token_secret: _CONFIG._TWITTER_USECRET
		});


		// Initializing Instagram Object
		this.inst = instagram;
		this.inst.set('client_id', _CONFIG._INSTAGRAM_TOKEN); 
		this.inst.set('client_secret', _CONFIG._INSTAGRAM_SECRET); 
		this.inst.set('callback_url', _CONFIG._INSTAGRAM_CALLBACK);
		//this.inst.subscriptions.unsubscribe({ id: 6112470 });
		// Instagram subscrition routes
		app.get('/subscribe', function(request, response){
		  	self.inst.subscriptions.handshake(request, response); 
		});
		app.post('/subscribe', function(request, response) {
			self.onInstagram(request, response)
		});


		// Reading initial configuration
		// Twitter Socket
		self.initTwitter(this.config.hashtag);

		// Instagram Socket
		self.initInstagram(this.config.hashtag);


		// Initializing Redis Client
		this.redis = redis.createClient('6499', 'redis-ricard.eu-fr-1.ente.io');
		if (_CONFIG._ENV == 'dev') {
			this.redis.select(2); 
		}
		this.redis.auth(_CONFIG._REDIS_PASSWORD);
		this.redis.on('ready', function() {
			_UTILS.debug('[REDIS] Connection successful');
		});

	},

	initInstagram: function initInstagram(hash) {
		this.inst.subscriptions.subscribe({
			object: 'tag',
	        object_id: hash,
	        complete: function(data) {
	        	_UTILS.debug('[INSTAGRAM] Subscribed to #' + data.object_id);
	        }
    	});
	},

	initTwitter: function initTwitter(hash) {
		var self = this;

		_UTILS.debug('[TWITTER] Listening to #' + hash);
		this.twitr.stream('filter', { track: hash }, function(stream) {
		    stream.on('data', function(data) {
		    	self.onTwitter(data);
		    });
		    stream.on('error', function(err) {
		    	_UTILS.debug('[TWITTER] Error!', err);
		    	// if "Enhance your calm", reconnect in 60 seconds
		    	setTimeout(function() {
		    		self.initTwitter(hash);
		    	}, 60000);
		    });
	    });
	},

	api: function api(request, params, store, nobroadcast, socket) {
		params 		= params 	  || {};
		store  		= store  	  || false;
		nobroadcast = nobroadcast || false;
		socket      = socket      || false;

		var data = JSON.stringify({
			request: request,
			params: params
		});
		if (nobroadcast) {
			_UTILS.debug('[WS] Sending: ', data);
			socket.send(data);
		} else {
			_UTILS.debug('[WS] Broadcasting: ', data);
			this.server.broadcast(data);
		}

		if (store) {
			var type = params.type;
			switch (params.type) {
				case 'twitter':
					var type = "twitter_feed";
					break;
				case 'instagram':
					var type = "instagram_feed";
					break;
			}
			this.redis.HSET(type, params.id, JSON.stringify(params), function(err, res) {
				_UTILS.debug('[REDIS] Item inserted in ' + type);
			});
		}
	},

	onTwitter: function onTwitter(data) {
        var item = {
        	type: 'twitter',
        	id: data.id_str,
        	img: (data.entities.media && data.entities.media.length > 0 ? data.entities.media[0].media_url : null),
        	text: data.text,
        	user: (data.user ? data.user.screen_name : null),
        	user_img: (data.user ? data.user.profile_image_url : null)
        };
		_UTILS.debug('[TWITTER] Received new item: ', item);
    	this.api(item.type, item, true);
	},

	onInstagram: function onInstagram(request, response) {
		var self = this;

		var body = request.body;
		var tag  = request.body[0];
		_UTILS.debug('[INSTAGRAM] #' + tag.object_id + ' updated!');
		if (tag.object_id === this.config.hashtag) {
			var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id=' + _CONFIG._INSTAGRAM_TOKEN + '&' +new Date().getTime();
			https.get(url, function(res) {
				var body = '';

				res.on('data', function(chunk) {
					body += chunk;
				});

			    res.on('end', function() {
			        var data = JSON.parse(body).data[0];
			        var item = {
			        	type: 'instagram',
			        	id: data.id,
			        	img: (data.images ? data.images.standard_resolution.url : null),
			        	text: (data.caption ? data.caption.text : ''),
			        	user: (data.user ? data.user.username : null),
			        	user_img: (data.user ? data.user.profile_picture : null)
			        };
			        _UTILS.debug('[INSTAGRAM] Received new item: ', item.id);
			    	self.api(item.type, item, true);
			    });
			});
		}
	},

	modifyConfig: function modifyConfig(config) {
		this.config = config;
		this.api('config', config);
	},

	getStored: function getStored(callback) {
		var data = new Object();
		var hashes = ['twitter_feed', 'instagram_feed', 'twitter_moderate', 'instagram_moderate'];
		for (var i = 0; i < hashes.length; i++) {
			var h = hashes[i];
			var state = i;
			this.getHash(h, state, function(d, name, s) {
				data[name] = d;
				if (s == hashes.length - 1) {
					callback(data);
				}
			})
		}
	},

	getModerated: function getModerated(callback) {
		var data = new Object();
		var hashes = ['twitter_moderate', 'instagram_moderate'];
		for (var i = 0; i < hashes.length; i++) {
			var h = hashes[i];
			var state = i;
			this.getHash(h, state, function(d, name, s) {
				data[name] = d;
				if (s == hashes.length - 1) {
					callback(data);
				}
			})
		}
	},

	getHash: function getHash(name, state, callback) {
		this.redis.HGETALL(name, function(err, h) {
			callback(h, name, state);
		});
	},

	action: function action(action, data) {
		var type = data.type;
		if (type == 'twitter') {
			type = 'twitter_feed';
		} else if (type == 'instagram') {
			type = 'instagram_feed';
		}

		if (action == 'validate') {
			this.validate(type, data.id);
		} else if (action == 'deny') {
			this.redis.HDEL(type, data.id);
			this.api(action, {id: data.id});
		} else if (action == 'fav') {
			this.validate(type, data.id, true);
		} else if (action == 'rocket') {
			this.validate(type, data.id, false, true);
		} else if (action == 'winner') {
			this.validate(type, data.id, false, true, true);
		}
	},

	rerocket: function rerocket(data, winner) {
		var self = this;

		this.redis.HGET(data.type, data.id, function(err, d) {
			self.api('rocket', d);
		})
	},

	validate: function validate(type, id, fav, rocket, winner) {
		var self = this;

		fav 	= fav    || false;
		rocket  = rocket || false;
		winner  = winner || false;

		this.redis.HGET(type, id, function(err, d) {
			self.redis.HDEL(type, id);
			var d = JSON.parse(d);
			if (d.type.indexOf('_moderate') == -1) {
				d.type = d.type + '_moderate';
			}
			if (fav) {
				d.fav = true;
			}
			if (rocket) {
				if (winner) {
					d.winner = true;
				}
				d.rocket = true;
				self.api('rocket', d);				
			}
			self.api(d.type, d, true);
		});
	}

};

// Web Server
app.use(express.static('./'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/', function (req, resp) {
  resp.set('Content-Type', 'text/plain; charset=utf-8');
  resp.end();
});

App.init();
