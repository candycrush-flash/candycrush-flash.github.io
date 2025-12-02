function getProfile() {
	return parseInt(localStorage.getItem('selectedProfile')) || 1;
}

function unlockLevels() {
	var maxLevel = parseInt(prompt(getString('UNLOCK_LEVEL_PROMPT'))); 
	if(maxLevel != null && (maxLevel == '' || maxLevel > 0)) {
		maxLevel = parseInt(maxLevel) || 2825;
		var univ = localStorage.getItem('userUniverse_' + getProfile());
		var d = JSON.parse(univ);
		var i, j, ep, lvl;
		for(i=1; i<=maxLevel; i++) {
			if(i > 2825) break;
			ep = d.episodes.find(item => item.id == levelInfo[i][0]);
			if(!ep) ep = d.episodes[d.episodes.push({ id: levelInfo[i][0], levels: [] }) - 1];
			lvl = ep.levels.find(item => item.id == levelInfo[i][1]);
			if(!lvl) {
				ep.levels.push({
					id: levelInfo[i][1],
					episodeId: levelInfo[i][0],
					score: 0,
					stars: 0,
					unlocked: true,
					completedAt: -1,
					unlockConditionDataList: [],
				});
			} else if(!lvl.unlocked) {
				lvl.unlocked = true;
			}
		}
		localStorage.setItem('userUniverse_' + getProfile(), JSON.stringify(d));
		history.go(0);
	}
}

function chargeHearts() {
	if(!confirm(getString('CHARGE_LIVES_PROMPT'))) return;
	var user = localStorage.getItem('currentUser_' + getProfile()); 
	var d = JSON.parse(user); 
	d.lives = d.maxLives; 
	localStorage.setItem('currentUser_' + getProfile(), JSON.stringify(d)); 
	history.go(0);
}

function extendHearts() {
	var maxLives = parseInt(prompt(getString('EXTEND_LIVES_PROMPT'))); 
	if(maxLives && maxLives > 0) {
		var user = localStorage.getItem('currentUser_' + getProfile()); 
		var d = JSON.parse(user); 
		d.maxLives = maxLives; 
		d.lives = maxLives; 
		localStorage.setItem('currentUser_' + getProfile(), JSON.stringify(d)); 
		history.go(0);
	}
}

function escapeHTML(s) {
	return s.replace(/[&]/g, '&amp;').replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;').replace(/["]/g, '&quot;')
}

function loadProfiles() {
	var profiles = JSON.parse(localStorage.getItem('profiles'));
	if(!profiles || !profiles.profiles.length) {
		profiles = { 
			increment: 1, 
			profiles: [{
				name: 'Default', 
				id: 1 
			}],
		};
		localStorage.setItem('profiles', JSON.stringify(profiles));
		localStorage.setItem('selectedProfile', '1');
		var boosters = localStorage.getItem('boosters');
		var candyProperties = localStorage.getItem('candyProperties');
		var currentUser = localStorage.getItem('currentUser');
		var userUniverse = localStorage.getItem('userUniverse');
		var wheelData = localStorage.getItem('wheelData');
		if(boosters)
			localStorage.setItem('boosters_1', boosters);
		if(candyProperties)
			localStorage.setItem('candyProperties_1', candyProperties);
		if(currentUser)
			localStorage.setItem('currentUser_1', currentUser);
		if(userUniverse)
			localStorage.setItem('userUniverse_1', userUniverse);
		if(wheelData)
			localStorage.setItem('wheelData_1', wheelData);
	}
	var pfList = document.getElementById('profileList');
	for(var pf of profiles.profiles) {
		var li = document.createElement('li');
		li.setAttribute('data-id', pf.id);
		li.innerHTML = '<a onclick="setProfile(' + pf.id + ');">' + escapeHTML(pf.name) + '</a>';
		if(pf.id == getProfile())
			li.innerHTML = '<b>' + escapeHTML(pf.name) + '</b>';
		pfList.appendChild(li);
	}
}

function newProfile() {
	var name = prompt(getString('ENTER_PROFILE_NAME'));
	if(name == '') return alert(getString('OPERATION_CANCELLED'));
	else if(!name) return;
	var profiles = JSON.parse(localStorage.getItem('profiles'));
	for(var item of profiles.profiles)
		if(item.name == name) {
			alert(getString('NAME_ALREADY_EXISTS'));
			return;
		}
	var id = profiles.increment + 1;
	var li = document.createElement('li');
	profiles.profiles.push({ name, id });
	li.setAttribute('data-id', id);
	li.innerHTML = '<a onclick="setProfile(' + id + ');">' + escapeHTML(name) + '</a>';
	document.getElementById('profileList').appendChild(li);
	profiles.increment++;
	localStorage.setItem('profiles', JSON.stringify(profiles));
}

function deleteProfile() {
	if(!confirm(getString('DELETE_PROFILE_CONFIRM'))) return;
	var profiles = JSON.parse(localStorage.getItem('profiles'));
	var pfidx = profiles.profiles.findIndex(item => item.id == getProfile());
	if(pfidx < 0) return alert(getString('PROFILE_NOT_FOUND'));
	var id = profiles.profiles[pfidx].id;
	profiles.profiles.splice(pfidx, 1);
	document.querySelector('li[data-id="' + id + '"]').remove();
	localStorage.setItem('selectedProfile', '1');
	localStorage.setItem('profiles', JSON.stringify(profiles));
	localStorage.removeItem('boosters_' + id);
	localStorage.removeItem('candyProperties_' + id);
	localStorage.removeItem('currentUser_' + id);
	localStorage.removeItem('userUniverse_' + id);
	localStorage.removeItem('wheelData_' + id);
	history.go(0);
}

function renameProfile() {
	var name = prompt(getString('NEW_NAME_PROMPT'));
	if(name == '') return alert(getString('OPERATION_CANCELLED'));
	else if(!name) return;
	var profiles = JSON.parse(localStorage.getItem('profiles'));
	var pf = profiles.profiles.find(item => item.id == getProfile());
	if(!pf) return alert(getString('PROFILE_NOT_FOUND'));
	for(var item of profiles.profiles) {
		if(item.name == name && item.id != pf.id) {
			alert(getString('NAME_ALREADY_EXISTS'));
			return;
		}
	}
	pf.name = name;
	document.querySelector('li[data-id="' + pf.id + '"] a').textContent = name;
	localStorage.setItem('profiles', JSON.stringify(profiles));
}

function importProfile() {
	var profiles = JSON.parse(localStorage.getItem('profiles'));
	var data = prompt(getString('PROFILE_DATA_PROMPT'));
	if(data == null) return;
	try {
		data = JSON.parse(data);
	} catch(e) {
		return alert(getString('INVALID_DATA'));
	}
	if(!data.name) data.name = prompt(getString('ENTER_PROFILE_NAME'));
	if(!data.name) return;
	var name = data.name;
	for(var item of profiles.profiles) {
		if(item.name == name) {
			name = prompt(getString('IMPORT_ALREADY_EXISTS'));
			if(name == null) return;
			else if(!name) name = data.name;
		}
	}
	var profiles = JSON.parse(localStorage.getItem('profiles'));
	var id = profiles.increment + 1;
	var li = document.createElement('li');
	profiles.profiles.push({ name, id });
	li.setAttribute('data-id', id);
	li.innerHTML = '<a onclick="setProfile(' + id + ');">' + escapeHTML(name) + '</a>';
	document.getElementById('profileList').appendChild(li);
	profiles.increment++;
	localStorage.setItem('profiles', JSON.stringify(profiles));
	if(data.boosters)
		localStorage.setItem('boosters_' + id, JSON.stringify(data.boosters));
	if(data.candyProperties)
		localStorage.setItem('candyProperties_' + id, JSON.stringify(data.candyProperties));
	if(data.currentUser)
		localStorage.setItem('currentUser_' + id, JSON.stringify(data.currentUser));
	if(data.userUniverse)
		localStorage.setItem('userUniverse_' + id, JSON.stringify(data.userUniverse));
	if(data.wheelData)
		localStorage.setItem('wheelData_' + id, JSON.stringify(data.wheelData));
}

function exportProfile() {
	var profiles = JSON.parse(localStorage.getItem('profiles'));
	var pf = profiles.profiles.find(item => item.id == getProfile());
	if(!pf) return alert(getString('PROFILE_NOT_FOUND'));
	var a, b, c, d, e;
	a = localStorage.getItem('boosters_' + pf.id);
	b = localStorage.getItem('candyProperties_' + pf.id);
	c = localStorage.getItem('currentUser_' + pf.id);
	d = localStorage.getItem('userUniverse_' + pf.id);
	e = localStorage.getItem('wheelData_' + pf.id);
	var exp = { name: pf.name };
	if(a) exp.boosters = JSON.parse(a);
	if(b) exp.candyProperties = JSON.parse(b);
	if(c) exp.currentUser = JSON.parse(c);
	if(d) exp.userUniverse = JSON.parse(d);
	if(e) exp.wheelData = JSON.parse(e);
	prompt(getString('COPY_PROFILE_DATA'), JSON.stringify(exp));
}

function setProfile(id) {
	localStorage.setItem('selectedProfile', id + '');
	history.go(0);
}

function addBooster() {
	var boosters = JSON.parse(localStorage.getItem('boosters_' + getProfile()));
	if(!boosters) boosters = [];
	var ids = [0, 3241, 3240, 3134, 3125, 3124, 3122, 3120, 3118, 3108, 3106, 3105, 3102, 3101, 3100, 3202];
	var types = ['CandyUfoIngame', 'CandyStripedBrush', 'CandyBubbleGum', 'CandySweetTeeth', 'CandyJoker', 'CandyStripedWrapped', 'CandyAntiPeppar', 'CandyFreeSwitch', 'CandyCoconutLiquorice', 'CandySwedishFish', 'CandyHammer', 'CandyExtraMoves', 'CandyColorBomb', 'CandyExtraTime', 'CandyCharmOfFrozenTime'];
	var id = prompt(getString('BOOSTER_LIST'));
	if(id == '') return alert(getString('OPERATION_CANCELLED'));
	else if(!id) return;
	id = parseInt(id);
	var boosterID = ids[id];
	if(!boosterID) return alert(getString('OPERATION_CANCELLED'));
	var booster = boosters.find(item => item.typeId == boosterID);
	if(!booster) booster = boosters[boosters.push({
		type: types[id],
		category: "candyBooster",
		typeId: boosterID,
		amount: 0,
		availability: 2,
		leaseStatus: 0,
		unlocked: true,
	}) - 1];
	var amount = prompt(getString('BOOSTER_AMOUNT_PROMPT'));
	if(amount) {
		booster.amount += (parseInt(amount) || 0);
		if(booster.amount < 0) booster.amount = 0;
		localStorage.setItem('boosters_' + getProfile(), JSON.stringify(boosters));
		history.go(0);
	} else if(amount == '') {
		alert(getString('OPERATION_CANCELLED'));
	}
}

function addGold() {
	var gold = parseInt(prompt(getString('GOLDBAR_AMOUNT_PROMPT'))); 
	if(gold) {
		var boosters = JSON.parse(localStorage.getItem('boosters_' + getProfile()));
		if(!boosters) boosters = [];
		var golds = boosters.find(item => item.typeId == 3280);
		if(!golds) golds = boosters[boosters.push({
			type: "CandyHardCurrency",
			category: "candyBooster",
			typeId: 3280,
			amount: 0,
			availability: 2,
			leaseStatus: 0,
			unlocked: true,
		}) - 1];
		if(!golds.amount) golds.amount = 0;
		golds.amount += gold;
		if(golds.amount < 0) golds.amount = 0;
		localStorage.setItem('boosters_' + getProfile(), JSON.stringify(boosters)); 
		var user = localStorage.getItem('currentUser_' + getProfile()); 
		var d = JSON.parse(user); 
		d.gold = golds.amount; 
		localStorage.setItem('currentUser_' + getProfile(), JSON.stringify(d)); 
		history.go(0);
	}
}

function toggleCard(event) {
	var el = event.currentTarget;
	if(el.nextElementSibling.style.display == 'none') {
		el.nextElementSibling.style.display = 'block';
		localStorage.setItem('card_' + el.getAttribute('id'), '1');
	} else {
		el.nextElementSibling.style.display = 'none';
		localStorage.setItem('card_' + el.getAttribute('id'), '0');
	}
}

function initCards() {
	document.querySelectorAll('dt[id]').forEach(el => {
		if(localStorage.getItem('card_' + el.getAttribute('id')) == '0')
			el.nextElementSibling.style.display = 'none';
		el.addEventListener('click', toggleCard, false);
	});
}

function resetWheel() {
	if(!confirm(getString('RESET_WHEEL_CONFIRM'))) return;
	localStorage.removeItem('wheelData_' + getProfile());
	history.go(0);
}

function initDebugMode() {
	var debug = localStorage.getItem('debug_' + getProfile()) || '1';
	if(debug == '0')
		document.getElementById('toggleDebug').textContent = getString('ENABLE_DEBUG');
	else
		document.getElementById('toggleDebug').textContent = getString('DISABLE_DEBUG');
}

function toggleDebug() {
	var debug = localStorage.getItem('debug_' + getProfile()) || '1';
	if(debug == '0')
		localStorage.setItem('debug_' + getProfile(), '1');
	else
		localStorage.setItem('debug_' + getProfile(), '0');
	history.go(0);
}

function initInfiniteLives() {
	var inflife = localStorage.getItem('infiniteLives_' + getProfile()) || '0';
	if(inflife == '0')
		document.getElementById('toggleInfiniteLives').textContent = getString('ENABLE_INFINITE_LIVES');
	else
		document.getElementById('toggleInfiniteLives').textContent = getString('DISABLE_INFINITE_LIVES');
}

function toggleInfiniteLives() {
	var inflife = localStorage.getItem('infiniteLives_' + getProfile()) || '0';
	if(inflife == '0')
		localStorage.setItem('infiniteLives_' + getProfile(), '1');
	else
		localStorage.setItem('infiniteLives_' + getProfile(), '0');
	history.go(0);
}

function initInfiniteItems() {
	var infitems = localStorage.getItem('infiniteItems_' + getProfile()) || '0';
	if(infitems == '0')
		document.getElementById('toggleInfiniteItems').textContent = getString('ENABLE_INFINITE_ITEMS');
	else
		document.getElementById('toggleInfiniteItems').textContent = getString('DISABLE_INFINITE_ITEMS');
}

function toggleInfiniteItems() {
	var infitems = localStorage.getItem('infiniteItems_' + getProfile()) || '0';
	if(infitems == '0')
		localStorage.setItem('infiniteItems_' + getProfile(), '1');
	else
		localStorage.setItem('infiniteItems_' + getProfile(), '0');
	history.go(0);
}

function initBackground() {
	var body = document.body;
	var date = new Date();
	var month = date.getMonth() + 1, day = date.getDate();
	if(month == 10 && day == 31) {
		if(date.getFullYear() == 2015)
			body.className = 'halloween-2015';
		else
			body.className = 'halloween';
	} else if(month == 12 && day == 25) {
		body.className = 'xmas';
	}
}

function showCredits() {
	alert('Original game: King\nFlash version archive & offline patch: Enter Pearl (eientei)');
}
