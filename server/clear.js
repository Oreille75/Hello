var _CONFIG = require('./config');
var redis = require('redis');
var instagram  = require('instagram-node-lib'); 

// Flush redis
// var red = redis.createClient('6499', 'redis-ricard.eu-fr-1.ente.io');
// red.auth(_CONFIG._REDIS_PASSWORD);
// red.on('ready', function() {
// 	redis.FLUSHDB();
// });

// Flush instagram subscriptions
instagram.set('client_id', _CONFIG._INSTAGRAM_TOKEN); 
instagram.set('client_secret', _CONFIG._INSTAGRAM_SECRET); 
instagram.set('callback_url', _CONFIG._INSTAGRAM_CALLBACK);
instagram.tags.unsubscribe({object:'all'});
