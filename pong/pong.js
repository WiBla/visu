class Vec {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	get len() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	set len(value) {
		const f = value / this.len;
		this.x *= f;
		this.y *= f;
	}
}

class Rect {
	constructor(x = 0, y = 0) {
		let smallerSize = Math.min(canvas.width, canvas.height);
		this.pos = new Vec(0, 0);
		this.size = new Vec(smallerSize/100*x, smallerSize/100*y);
	}
	get left() {
		return this.pos.x - this.size.x / 2;
	}
	get right() {
		return this.pos.x + this.size.x / 2;
	}
	get top() {
		return this.pos.y - this.size.y / 2;
	}
	get bottom() {
		return this.pos.y + this.size.y / 2;
	}
}

class Ball extends Rect {
	constructor() {
		super(5, 5);
		this.vel = new Vec;
	}
}

class Player extends Rect {
	constructor() {
		
		super(5, 30);
		this.vel = new Vec;
		this.score = 0;

		this._lastPos = new Vec;
	}
	update(dt) {
		this.vel.y = (this.pos.y - this._lastPos.y) /dt;
		this._lastPos.y = this.pos.y;
	}
}

class Pong {
	constructor(canvas) {
		this._canvas = canvas;
		this._context = canvas.getContext('2d');

		this._accumulator = 0;
		this.step = 1/60;

		this.initialSpeed = 250;

		this.ball = new Ball;

		this.players = [
			new Player,
			new Player,
		];

		// Array of sounds if later I decide to add some more..
		this.sounds = {
			// Source on https://www.freesound.org/people/NoiseCollector/sounds/4359/
			blip: new Audio('4359__noisecollector__pongblipf4.wav'),
		};

		for (var sound in this.sounds) {
			this.sounds[sound].volume = 0.1;
		}

		this.players[0].pos.x = 20;
		this.players[1].pos.x = this._canvas.width - 20;
		this.players.forEach(p => p.pos.y = this._canvas.height / 2);

		let lastTime = null;
		this._frameCallback = (ms) => {
			if (lastTime !== null) {
				this.update((ms - lastTime)/1000);
				this.draw();
			}
			lastTime = ms;
			requestAnimationFrame(this._frameCallback);
		};

		this.CHAR_PIXEL = 10;
		this.CHARS = [
			'111101101101111',
			'010010010010010',
			'111001111100111',
			'111001111001111',
			'101101111001001',
			'111100111001111',
			'111100111101111',
			'111001001001001',
			'111101111101111',
			'111101111001111',
		].map(str => {
			const canvas = document.createElement('canvas');
			const s = this.CHAR_PIXEL;
			canvas.height = s * 5;
			canvas.width = s * 3;
			const context = canvas.getContext('2d');
			context.fillStyle = '#fff';
			str.split('').forEach((fill, i) => {
				if (fill === '1') {
					context.fillRect((i % 3) * s, (i / 3 | 0) * s, s, s);
				}
			});
			return canvas;
		});

		this.reset();
	}
	clear() {
		this._context.fillStyle = '#000';
		this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
	}
	collide(player, ball) {
		if (player.left < ball.right && player.right > ball.left &&
			  player.top < ball.bottom && player.bottom > ball.top) {
			const len = ball.vel.len;
			ball.vel.x = -ball.vel.x;
			ball.vel.len = len * 1.05;
			this.sounds.blip.play();
		}
	}
	draw() {
		this.clear();

		this.drawRect(this.ball);
		this.players.forEach(player => this.drawRect(player));

		this.drawScore();
	}
	drawRect(rect) {
		this._context.fillStyle = '#FFF';
		this._context.fillRect(rect.left,rect.top, rect.size.x,rect.size.y);
	}
	drawScore() {
		const align = this._canvas.width / 3;
		const CHARS_W = this.CHAR_PIXEL * 4;
		this.players.forEach((player, index) => {
			const chars = player.score.toString().split('');
			const offset = align * (index + 1) - (CHARS_W * chars.length / 2) + this.CHAR_PIXEL / 2;
			chars.forEach((char, pos) => {
				this._context.drawImage(this.CHARS[char|0], offset + pos * CHARS_W, 20);
			});
		});
	}
	play() {
		const b = this.ball;
		if (b.vel.x === 0 && b.vel.y === 0) {
			b.vel.x = 200 * (Math.random() > .5 ? 1 : -1);
			b.vel.y = 200 * (Math.random() * 2 - 1);
			b.vel.len = this.initialSpeed;
		}
	}
	reset() {
		this.ball.pos.x = this._canvas.width/2;
		this.ball.pos.y = this._canvas.height/2;

		this.players[1].pos.y = this.ball.pos.y;

		this.ball.vel.x = 0;
		this.ball.vel.y = 0;
	}
	start() {
		requestAnimationFrame(this._frameCallback);
	}
	simulate(dt) {
		const cvs = this._canvas;
		const ball = this.ball;
		ball.pos.x += ball.vel.x * dt;
		ball.pos.y += ball.vel.y * dt;

		if (ball.right < 0 || ball.left > cvs.width) {
			++this.players[ball.vel.x < 0 | 0].score;
			this.reset();
		}
		if (ball.vel.y < 0 && ball.top < 0 ||
			ball.vel.y > 0 && ball.bottom > cvs.height) {
			ball.vel.y = -ball.vel.y;
		}

		if ((this.players[1].pos.y - ball.pos.y) > 2 ||
			  (this.players[1].pos.y - ball.pos.y) < -2) {
			if (this.players[1].pos.y > ball.pos.y) this.players[1].pos.y -= 2;
			else if (this.players[1].pos.y < ball.pos.y) this.players[1].pos.y += 2;
		}

		this.players.forEach(player => {
			player.update(dt);
			this.collide(player, ball);
		});
	}
	update(dt) {
		this._accumulator += dt;
		while(this._accumulator > this.step) {
			this.simulate(this.step);
			this._accumulator -= this.step;
		}
	}
}

const canvas = document.getElementById('pong');
const pong = new Pong(canvas);

canvas.addEventListener('click', () => pong.play());

canvas.addEventListener('mousemove', event => {
	const scale = event.offsetY / event.target.getBoundingClientRect().height;
	pong.players[0].pos.y = canvas.height * scale;
});

pong.start();
