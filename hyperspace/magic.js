class Vec {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	get len() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	set len(value) {
		const factor = value / this.len;
		this.x *= factor;
		this.y *= factor;
	}
}

class particle {
	constructor(w, h) {
		this.pos = new Vec(canvas.width/2, canvas.height/2);
		this.size = new Vec(Math.random()*5, Math.random()*5);
		this.vel = new Vec(
			(this.size.x*100) * (Math.random() > .5 ? 1 : -1),
			(this.size.y*100) * (Math.random() > .5 ? 1 : -1))
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

class Animation {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');

		let lastTime;
		const callback = (ms) => {
			if (lastTime) {
				this.update((ms - lastTime) / 1000);
			}
			lastTime = ms;
			requestAnimationFrame(callback);
		};
		callback();

		const particlesNb = 100;
		this.particles = [];
		for (var i = 0; i < particlesNb; i++) {
			this.particles.push(new particle);
		}
	}
	drawParticle(particle) {
		let gradient = this.ctx.createRadialGradient(particle.pos.x,particle.pos.x,0, particle.pos.x,particle.pos.x,particle.size.x);
		gradient.addColorStop('0','#8bf');
		gradient.addColorStop('1','#0bf');
		this.ctx.fillStyle = gradient;

		this.ctx.beginPath();
		this.ctx.arc(particle.pos.x,particle.pos.y, particle.size.x, 0,Math.PI*2);
		this.ctx.fill();
	}
	replaceParticle(index) {
		this.particles.splice(index,1);
		this.particles.push(new particle);
	}
	update(dt) {
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect(0,0, this.canvas.width,this.canvas.height);

		this.particles.forEach((particle) => {
			particle.pos.x += particle.vel.x * dt;
			particle.pos.y += particle.vel.y * dt;
			particle.size.x *= particle.vel.len/particle.vel.len*0.99;

			if (particle.top < 0 || particle.bottom > this.canvas.height ||
				  particle.left < 0 || particle.right > this.canvas.width) {
				this.replaceParticle(this.particles.indexOf(particle));
			}

			this.drawParticle(particle);
		});
	}
}

const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const animation = new Animation(canvas);

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});
