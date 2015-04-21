var Item = function Item(type, data, container, admin) {
	var admin = admin || false;

	var otype = type;

	if (type == "twitter" || type == "twitter_moderate") {
		type = "tweet";
		data.user_img = data.user_img.replace('_normal', '_bigger');
	} else if (type == "instagram" || type == "instagram_moderate") {
		type = "inst";
	}

	if (!document.getElementById(data.id)) {
		var item = document.createElement('div');
		item.setAttribute('id', data.id);
		item.setAttribute('class', "item " + type + (data.img ? ' pic' : '') + (admin && data.fav && !data.rocket && !data.winner ? ' fav' : '') + (admin && data.rocket && !data.winner ? ' rocket' : '') + (admin && data.winner ? ' winner' : ''));

		if (data.img) {
			var picture = document.createElement('div');
			picture.setAttribute('class', 'itempicture');
			item.appendChild(picture);

				var imgpicture = document.createElement('img');
				imgpicture.setAttribute('src', data.img);
				picture.appendChild(imgpicture);
		}

			var cont = document.createElement('div');
			cont.setAttribute('class', 'itemcontent');
			item.appendChild(cont);

				var user = document.createElement('div');
				user.setAttribute('class', 'user');
				cont.appendChild(user);

					var avatar = document.createElement('div');
					avatar.setAttribute('class', 'avatar');
					user.appendChild(avatar);

						var avatarimg = document.createElement('img');
						avatarimg.setAttribute('src', data.user_img);
						avatar.appendChild(avatarimg);

					var username = document.createElement('div');
					username.setAttribute('class', 'username');
					username.innerText = '@' + data.user;
					user.appendChild(username);

				var text = document.createElement('p');
				text.innerText = data.text;
				cont.appendChild(text);

				var clear = document.createElement('div');
				clear.setAttribute('class', 'clear');
				cont.appendChild(clear);

			var clear = document.createElement('div');
			clear.setAttribute('class', 'clear');
			item.appendChild(clear);

			if (admin) {
				var actions = document.createElement('div');
				actions.setAttribute('class', 'actions');
				actions.setAttribute('data-type', otype);
				actions.setAttribute('data-id', data.id);
				item.appendChild(actions);

					if (otype != 'twitter_moderate' && otype != 'instagram_moderate') {
						var validate = document.createElement('div');
						validate.setAttribute('class', 'action validate');
						actions.appendChild(validate);

						var deny = document.createElement('div');
						deny.setAttribute('class', 'action deny');
						actions.appendChild(deny);

						var fav = document.createElement('div');
						fav.setAttribute('class', 'action fav');
						actions.appendChild(fav);
					}

					var rocket = document.createElement('div');
					rocket.setAttribute('class', 'action rocket');
					actions.appendChild(rocket);

					var win = document.createElement('div');
					win.setAttribute('class', 'action win');
					actions.appendChild(win);

			}

		if (admin) {
			var firstChild = container.firstChild;
			var el = null;
			if (firstChild) {
				container = firstChild.parentNode;
				el = firstChild;
			}
			container.insertBefore(item, el);
		} else {
			container.appendChild(item);
		}
	}
};
