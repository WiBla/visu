let wrapper = document.getElementById('wrapper');
const rules = [ // http://atlas.wolfram.com/01/01/90/
	[1,1,1, false],
	[1,1,0, true ],
	[1,0,1, false],
	[1,0,0, true ],
	[0,1,1, true ],
	[0,1,0, false],
	[0,0,1, true ],
	[0,0,0, false]
];

function getBinStatus(div) {
	return (div.className == 'alive' ? 1 : 0);
}

function createFirstRow(isRandom) {
	let row = document.createElement('div');
	row.className = 'row';

	for (let i = 0; i < 100; i++) {
		let div = document.createElement('div');

		if (isRandom)
			div.className = (Math.round(Math.random()) ? 'alive' : 'dead');
		else
			div.className = (i == 50 ? 'alive' : 'dead');

		row.appendChild(div);
	}

	wrapper.appendChild(row);
}

function createRow() {
	let prevRow = document.querySelector('.row:last-child').cloneNode(true);
	let row = document.createElement('div');
	row.className = 'row';

	for (let i = 0; i < 100; i++) {
		let div = document.createElement('div');
		let prevLeft = prevRow.children[i - 1] || prevRow.children[99];
		let prevTop = prevRow.children[i];
		let prevRight = prevRow.children[i + 1] || prevRow.children[0];

		rules.forEach(option => {
			let shouldLive = option[3];

			if (getBinStatus(prevLeft)  === option[0] &&
				  getBinStatus(prevTop)   === option[1] &&
				  getBinStatus(prevRight) === option[2])
				if (shouldLive)
					div.className = 'alive';
				else
					div.className = 'dead';
		});

		row.appendChild(div);
	}

	wrapper.appendChild(row);
}

// Append '?random=false' to the URL to start with a single dot in the middle
location.search.slice(1).split('&').forEach((value) => {
	value = value.split('=');
	switch(value[0]) {
		case 'random':
			createFirstRow(value[1] === 'true');
		break;

		default:
			createFirstRow(true);
		break;
	}
});
setInterval(function() {
	createRow();
}, 250);
