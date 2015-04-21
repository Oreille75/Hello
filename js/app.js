var App = {
	paused: true,
	current: 'title',
	forced: false,
	feedHeight: 720,
	newItems: 0,

	init: function init() {
		var self = this;

		var feed = document.getElementById('feed_mover');
		if (document.getElementById('feed_mover').getElementsByTagName('div').length <= 3) {
			this.forced = true;
		}

		// Feed animation setup
		window.setInterval(function() {
			if (!self.paused) {
				var feedh = Number(feed.offsetHeight) - 720;
				self.feedHeight = (feedh < 720 ? self.feedHeight : feedh);
				var margin = Number(window.getComputedStyle(feed).getPropertyValue('margin-top').split('px')[0]);

				if (margin < 0 && margin * - 1 > self.feedHeight) {
					self.paused = true;
					self.forced = true;
					self.displayHome();
				}

				if (!self.paused) {
					feed.style['margin-top'] = margin - 1 + 'px';
				}
			}
		}, 40);

		// Screen rotations
		var timer = 0;
		window.setInterval(function() {
			timer++;
			if (!Client.config.manual) {
				if (!self.forced) {
					if (self.current == 'title' && timer % Client.config.timers.title == 0) {
						self.displayFeed();
					} else if (self.current == 'feed' && timer % Client.config.timers.feed == 0) {
						self.displayHome();
					}
				}
			}

			if (self.forced && self.newItems > 4) {
				self.feedHeight = self.feedHeight + (5 * 150);
				self.forced = false;
				self.newItems = 0;
				if (Client.config.manual) {
					var type = 'feed';
					if (Client.config.force == 1) {
						var type = 'title';
					}
					if (type != self.current) {
						if (type == 'title') {
							self.displayHome();
						} else if (type == 'feed') {
							self.displayFeed();
						}
					}
				}
			}

		}, 1000);
	},

	feed: function feed(type, data) {
		_UTILS.debug('[FEED] Receiving new item.', type, data);

		this.newItems++;

		var c1 = document.getElementById('feed_column1');
		var c2 = document.getElementById('feed_column2');
		var c1count = this.countItems(c1);
		var c2count = this.countItems(c2);

		if (c1count > c2count) {
			var container = c2;
		} else {
			var container = c1;
		}
		if ((type.indexOf('twitter') != -1 && Client.config.twitter) || (type.indexOf('instagram') != -1 && Client.config.instagram)) {
			new Item(type, data, container);
		}

	},

	manual: function manual(type) {
		if (type === 1 && this.current != 'title') {
			this.displayHome();
		} else if (type === 2 && this.current != 'feed') {
			this.displayFeed();
		} else if (type === 3 && this.current != 'rocket') {
			this.displayRocket();
		}
	},

	displayFeed: function displayFeed() {
		this.playFeed();
		this.current = 'feed';

		document.body.classList.add('hide');
		window.setTimeout(function() {

			document.body.className = 'feed show';
			window.setTimeout(function() {

				document.body.classList.remove('show');

			}, 200);

		}, 200);
	},

	displayHome: function displayHome() {
		var self = this;

		this.current = 'title';

		document.body.classList.add('hide');
		window.setTimeout(function() {
			
			self.pauseFeed();

			document.body.className = 'home show';
			window.setTimeout(function() {

				document.body.classList.remove('show');

			}, 200);

		}, 200);
	},

	displayRocket: function displayRocket() {
		var data = Client.latestRocket;
		if (data) {
			this.rocket(data);
		}
	},

	rocket: function rocket(data) {
		var self = this;

		_UTILS.debug('[ROCKET] Receiving new item!', data);

		try {
			data = JSON.parse(data);
		} catch(e) {}

		if (Client.config.rocket) {
			this.pauseFeed();

			var previous = this.current;
			this.current = 'rocket';

			var type = data.type.split('_')[0];
			if (type == 'twitter') {
				data.user_img = data.user_img.replace('_normal', '_bigger');
			}
			this.populateRocket(data);

			var original = document.body.className;

			document.body.classList.add('hide');
			window.setTimeout(function() {

				document.getElementById('zoom').className = 'zoom';
				document.body.className = 'show zoom zoom' + type + (data.img ? ' zoompic' : '');

				// Wait for the time to display the first screen
				window.setTimeout(function() {

					document.getElementById('zoomzoom').classList.add('hide');
					document.getElementById('zoomwinner').classList.add('hidenow');
					document.body.classList.remove('show');

					// if this is a winner!
					if (data.winner) {
						window.setTimeout(function() {

							document.getElementById('zoom').className = 'winner';
							document.getElementById('zoomzoom').classList.remove('hide');
							document.getElementById('zoomwinner').className = 'show';

								// Wait for the time to display the second screen
								window.setTimeout(function() {

									// Stay here if manual is forced to zoom
									if (Client.config.manual && Client.config.force == 3) {
									} else {
										document.getElementById('zoomwinner').className = '';
										if (previous == 'feed') {
											self.displayFeed();
										} else if (previous == 'title') {
											self.displayHome();
										}
									}

								}, Client.config.timers.winner * 1000);

						}, 300);
					} else {
						document.getElementById('zoomzoom').classList.remove('hide');

						window.setTimeout(function() {							

							// Stay here if manual is forced to zoom
							if (Client.config.manual && Client.config.force == 3) {
							} else {
								if (previous == 'feed') {
									self.displayFeed();
								} else if (previous == 'title') {
									self.displayHome();
								}
							}

						}, 300);							
					}

				}, Client.config.timers.zoom * 1000);

			}, 300);
		}
	},

	pauseFeed: function pauseFeed() {
		this.paused = true;
	},

	playFeed: function playFeed() {
		this.paused = false;
	},

	populateRocket: function populateRocket(data) {
		if (data.img) {
			document.getElementById('polaimg').setAttribute('src', data.img);
		}
		document.getElementById('zoomavatarimg').setAttribute('src', data.user_img);
		document.getElementById('zoomusername').innerText = '@' + data.user;
		document.getElementById('zoomtext').innerText = data.text;

		document.getElementById('zoomavatarvip').setAttribute('src', data.user_img);
	},

	resetFeed: function resetFeed() {
		var self = this;

		this.forced = true;
		var timer = 200;
		if (this.current != 'title') {
			this.displayHome();
			timer = 5000;
		}

		window.setTimeout(function() {

			self.forced = false;
			document.getElementById('feed_mover').style['margin-top'] = '120px';
			self.displayFeed();

		}, timer);

	},

	countItems: function countItems(column) {
		var children = column.getElementsByTagName('div');
		var count = 0;
		for (var i = 0; i < children.length; i++) {
			if (children[i].classList.contains('item')) {
				count++;
			}
			if (children[i].classList.contains('pic')) {
				count++;
			}
		}
		return count;
	},

	moderated: function moderated(data) {
		var items = new Array();

		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				for (var k in data[key]) {
					if (data[key].hasOwnProperty(k)) {
						items.push({type: key, data: JSON.parse(data[key][k])})
					}
				}
			}
		}

		var items = this.shuffle(items);
		for (var i = 0; i < items.length; i++) {
			this.feed(items[i].type, items[i].data);
		}

	},

	shuffle: function shuffle(o) {
	    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	}

};

window.onload = function() {
	Client.connect();
	App.init();
};
