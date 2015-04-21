var Admin = {

	feed: function feed(type, data) {
		var container = document.getElementById('twitter_feed');
		if (type == 'instagram') {		
			container = document.getElementById('instagram_feed');
		} else if (type == 'instagram_moderate') {
			this.dispose(data.id);
			container = document.getElementById('instagram_moderate');
		} else if (type == 'twitter_moderate') {
			this.dispose(data.id);
			container = document.getElementById('twitter_moderate');
		}
		if ((type.indexOf('twitter') != -1 && Client.config.twitter) || (type.indexOf('instagram') != -1 && Client.config.instagram)) {
			new Item(type, data, container, true);
		}
	},

	dispose: function dispose(id) {
		var original = document.getElementById(id);
		if (original) {
			original.parentNode.removeChild(original);
		}
	},

	stored: function stored(data) {
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				var type = key;
				if (type == 'twitter_feed') {
					type = 'twitter';
				} else if (type == 'instagram_feed') {
					type = 'instagram';
				}
				for (var k in data[key]) {
					if (data[key].hasOwnProperty(k)) {
						this.feed(type, JSON.parse(data[key][k]));
					}
				}
			}
		}
	},

	updateConfig: function udpateConfig(config) {
		document.getElementById('hashtag').value = config.hashtag;

		if (config.twitter) {
			document.getElementById('toggle_twitter_feed').checked = true;
		} else {
			document.getElementById('toggle_twitter_feed').checked = false;
		}

		if (config.instagram) {
			document.getElementById('toggle_instagram_feed').checked = true;
		} else {
			document.getElementById('toggle_instagram_feed').checked = false;
		}

		if (config.rocket) {
			document.getElementById('toggle_rocket').checked = true;
		} else {
			document.getElementById('toggle_rocket').checked = false;
		}

		document.getElementById('timer_title').value  = config.timers.title;
		document.getElementById('timer_feed').value   = config.timers.feed;
		document.getElementById('timer_zoom').value   = config.timers.zoom;
		document.getElementById('timer_winner').value = config.timers.winner;

		if (config.manual) {
			document.getElementById('manual').checked = config.manual;

			if (config.force == 1) {
				document.getElementById('force1').checked = true;
				document.getElementById('force2').checked = false;
				document.getElementById('force3').checked = false;
			}

			if (config.force == 2) {
				document.getElementById('force1').checked = false;
				document.getElementById('force2').checked = true;
				document.getElementById('force3').checked = false;
			}

			if (config.force == 3) {
				document.getElementById('force1').checked = false;
				document.getElementById('force2').checked = false;
				document.getElementById('force3').checked = true;
			}
		} else {
				document.getElementById('manual').checked = false;
				document.getElementById('force1').checked = false;
				document.getElementById('force2').checked = false;
				document.getElementById('force3').checked = false;
		}

	},

	resize: function resize() {
		var height = document.body.clientHeight - 122;
		var columns = document.getElementsByClassName('column');
		for (var i = 0; i < columns.length; i++) {
			columns[i].style.height = height + 'px';
		}
	}
}

window.onload = function() {
	Client.connect();

	Admin.resize();
	window.addEventListener('resize', Admin.resize);

	// Event delegation
	document.body.addEventListener('click', function(ev) {
		var target = ev.target;
		if (target.nodeName == "LI") {
			document.body.className = target.className;
		} else if (target.nodeName == "BUTTON" && target.id == "resetfeed") {
			console.log('reset feed!');
			Client.api('resetfeed');
		}
		if (target.classList.contains('action')) {
			var dataset = target.parentNode.dataset;
			if (target.classList.contains('validate')) {
				Client.action('validate', dataset.type, dataset.id);
			} else if (target.classList.contains('deny')) {
				Client.action('deny', dataset.type, dataset.id);
			} else if (target.classList.contains('fav')) {
				Client.action('fav', dataset.type, dataset.id);
			} else if (target.classList.contains('rocket')) {
				if (target.parentNode.parentNode.classList.contains('rocket')) {
					Client.action('rerocket', dataset.type, dataset.id);
				} else {
					target.parentNode.parentNode.classList.add('rocket');
					Client.action('rocket', dataset.type, dataset.id);				
				}
			} else if (target.classList.contains('win')) {
				if (target.parentNode.parentNode.classList.contains('winner')) {
					Client.action('rewinner', dataset.type, dataset.id);
				} else {
					target.parentNode.parentNode.classList.add('winner');
					Client.action('winner', dataset.type, dataset.id);				
				}
			}
		}
	});

	document.getElementById('toggle_twitter_feed').addEventListener('change', function(ev) {
		Client.config.twitter = ev.target.checked;
		Client.modifyConfig();
	});

	document.getElementById('toggle_instagram_feed').addEventListener('change', function(ev) {
		Client.config.instagram = ev.target.checked;
		Client.modifyConfig();
	});

	document.getElementById('toggle_rocket').addEventListener('change', function(ev) {
		Client.config.rocket = ev.target.checked;
		Client.modifyConfig();
	});

	document.getElementById('timer_title').addEventListener('blur', function(ev) {
		Client.config.timers.title = ev.target.value;
		Client.modifyConfig();
	});

	document.getElementById('timer_feed').addEventListener('blur', function(ev) {
		Client.config.timers.feed = ev.target.value;
		Client.modifyConfig();
	});

	document.getElementById('timer_zoom').addEventListener('blur', function(ev) {
		Client.config.timers.zoom = ev.target.value;
		Client.modifyConfig();
	});

	document.getElementById('timer_winner').addEventListener('blur', function(ev) {
		Client.config.timers.winner = ev.target.value;
		Client.modifyConfig();
	});

	document.getElementById('manual').addEventListener('change', function(ev) {
		var forced = Client.config.force;
		if (ev.target.checked) {
			if (forced == 1) {
				document.getElementById('force1').checked = true;
				document.getElementById('force2').checked = false;
				document.getElementById('force3').checked = false;
			} else if (forced == 2) {
				document.getElementById('force1').checked = false;
				document.getElementById('force2').checked = true;
				document.getElementById('force3').checked = false;
			} else if (forced == 3) {
				document.getElementById('force1').checked = false;
				document.getElementById('force2').checked = false;
				document.getElementById('force3').checked = true;
			}
		} else {
				document.getElementById('force1').checked = false;
				document.getElementById('force2').checked = false;
				document.getElementById('force3').checked = false;			
		}

		Client.config.manual = ev.target.checked;
		Client.modifyConfig();
	});

	document.getElementById('force1').addEventListener('change', function(ev) {
		document.getElementById('force2').checked = false;
		document.getElementById('force3').checked = false;	

		if (!ev.target.checked) {
			document.getElementById('manual').checked = false;
			Client.config.manual = false;
		} else {
			document.getElementById('manual').checked = true;
			Client.config.manual = true;
		}

		Client.config.force = 1;
		Client.modifyConfig();
	});

	document.getElementById('force2').addEventListener('change', function(ev) {
		document.getElementById('force1').checked = false;
		document.getElementById('force3').checked = false;	

		if (!ev.target.checked) {
			document.getElementById('manual').checked = false;
			Client.config.manual = false;
		} else {
			document.getElementById('manual').checked = true;
			Client.config.manual = true;
		}

		Client.config.force = 2;
		Client.modifyConfig();
	});

	document.getElementById('force3').addEventListener('change', function(ev) {
		document.getElementById('force1').checked = false;
		document.getElementById('force2').checked = false;	

		if (!ev.target.checked) {
			document.getElementById('manual').checked = false;
			Client.config.manual = false;
		} else {
			document.getElementById('manual').checked = true;
			Client.config.manual = true;
		}

		Client.config.force = 3;
		Client.modifyConfig();
	});
};