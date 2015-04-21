var _CONFIG = require('./config');

module.exports = {
	debug: function debug() {
		if (_CONFIG._DEBUG) {
			console.log.apply(console, arguments);
		}
	}
};