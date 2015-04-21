var Client = {
	config: {},
	latestRocket: null,

	connect: function connect() {
		var self = this;

		this.client = new WebSocket(_HOST);
		this.client.onopen = function() {
			self.requestConfig();
			if (typeof(Admin) == 'object') {
				self.getStored();
			}
			if (typeof(App) == 'object') {
				self.getModerated();
			}
		};
		this.client.onmessage = this.onMessage.bind(this);
	},

	onMessage: function onMessage(message) {
		message = JSON.parse(message.data);
		_UTILS.debug('[RECEIVED] message:', message);

		switch(message.request) {
			case 'config':
				_UTILS.debug('[CONFIG] catched: ', message.params);
				this.admin('updateConfig', message.params);			
				this.saveConfig(message.params);
				break;
			case 'twitter':
			case 'instagram':
				_UTILS.debug('[ITEM] Receiving new item (' + message.request + ')', message.params);
				this.admin('feed', message.request, message.params);
				break;
			case 'twitter_moderate':
			case 'instagram_moderate':
				_UTILS.debug('[ITEM] Receiving new item (' + message.request + ')', message.params);
				this.admin('feed', message.request, message.params);
				this.app('feed', message.request, message.params);
				break;
			case 'stored':
				_UTILS.debug('[REDIS] Receiving stored hashes', message.params);
				this.admin('stored', message.params);
				break;
			case 'moderated':
				_UTILS.debug('[REDIS] Receiving moderated hashes', message.params);
				this.app('moderated', message.params);
				break;
			case 'deny':
				_UTILS.debug('[ITEM] Deleting item', message.request, message.params);
				this.admin('dispose', message.params.id);
				break;
			case 'rocket':
				_UTILS.debug('[ITEM] Item rocket!', message.request, message.params);
				this.latestRocket = message.params;
				this.app('rocket', message.params);
				break;
			case 'resetfeed':
				this.app('resetFeed');
				break;
		}
	},

	admin: function admin() {
		if (typeof(Admin) == 'object') {
			var func = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1, arguments.length);

			Admin[arguments[0]].apply(Admin, args);
		}
	},

	app: function app() {
		if (typeof(App) == 'object') {
			var func = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1, arguments.length);

			App[arguments[0]].apply(App, args);
		}
	},

	requestConfig: function requestConfig() {
		_UTILS.debug('[CONFIG] Requesting config.');
		this.api('config');
	},

	getStored: function getStored() {
		_UTILS.debug('[REDIS] Requesting stored hashes.');
		this.api('getStored');
	},

	getModerated: function getStored() {
		_UTILS.debug('[REDIS] Requesting moderated stored hashes.');
		this.api('getModerated');
	},

	action: function action(action, type, id) {
		this.api(action, {
			type: type,
			id: id
		})
	},

	saveConfig: function saveConfig(config) {
		_UTILS.debug('[CONFIG] saved:', config);
		this.config = config;

		if (config.manual) {
			this.app('manual', config.force);
		}
	},

	modifyConfig: function modifyConfig(config) {
		config = config || this.config;

		this.saveConfig(config);
		this.api('modifyConfig', config);
	},

	api: function api(request, params) {
		params = params || {};
		this.client.send(JSON.stringify({
			request: request,
			params: params
		}));
	}
};