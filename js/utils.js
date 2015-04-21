var _UTILS = {
	debug: function debug() {
		if (_DEBUG) {
			console.log.apply(console, arguments);
		}
	}
}