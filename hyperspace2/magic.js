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
		let x;
		let y;
		let min = Math.min(canvas.width, canvas.height);
		let max = min*2;
		this.size = (Math.random()*(min-max) + min)/30; // pixels
		this.vel = this.size/20;

		// Variables accessible through the URL
		location.search.slice(1).split('&').forEach((value) => {
			value = value.split('=');
			switch(value[0]) {
				case 'color':
					if (value[1] == 'random') {
						this.color = function() {
							var letters = '0123456789ABCDEF';
							var color = '#';
							for (var i = 0; i < 6; i++ ) {
								color += letters[Math.floor(Math.random() * 16)];
							}
							return color;
						}();
					}
				break;
				default:
					this.color = [
						'#9C6BFF',
						'#C58AFF',
						'#6B3BB2',
						'#8D56B2',
						'#452A57'
					];
					this.color = this.color[Math.floor(Math.random()*(this.color.length))]
				break;
			}
		});

		// Creates particule on the side of canvas
		// (either top,bottom,left or right but always on a side)
		if (Math.random() > .5) {
			x = (Math.random() > .5 ? canvas.width : 0);
			y = Math.random()*(canvas.height+1);
		} else {
			x = Math.random()*(canvas.width+1);
			y = (Math.random() > .5 ? canvas.height : 0);
		}

		// Particules shall not be outside canvas
		x = x > 0 ? x - this.size/2 : x + this.size/2;
		y = y > 0 ? y - this.size/2 : y + this.size/2;

		this.pos = new Vec(x, y);
		this.size = new Vec(this.size,this.size);
		this.vel = new Vec(this.vel,this.vel);
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
		this.particlesNb = 100;
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

		this.particles = [];
		
	}
	drawParticle(particle) {
		let size = particle.size.x;
		size = size < 0 ? -size : size;

		this.ctx.fillStyle = particle.color;
		// this.ctx.fillRect(particle.left, particle.top, particle.size.x, particle.size.y);
		this.ctx.beginPath();
		this.ctx.arc(particle.pos.x,particle.pos.y,size, 0,Math.PI*2);
		/* Triangles
		this.ctx.moveTo(particle.pos.x-size,particle.pos.y+size);
		this.ctx.lineTo(particle.pos.x+size,particle.pos.y+size);
		this.ctx.lineTo(particle.pos.x, particle.pos.y-size);
		this.ctx.lineTo(particle.pos.x-size,particle.pos.y+size);
		this.ctx.stroke();
		*/
		this.ctx.fill();
	}
	replaceParticle(index) {
		this.particles.splice(index,1);
		this.particles.push(new particle);
	}
	update(dt) {
		// Add one particule per frame
		if (this.particlesNb >= this.particles.length) {
			this.particles.push(new particle);
		}	

		this.ctx.clearRect(0,0, this.canvas.width,this.canvas.height);

		this.particles.forEach((particle) => {
			// Make the particles shrink
			if (particle.size.x > .5) {
				particle.size.x *= 0.95;
				particle.vel.x *= 0.10;
			}
			if (particle.size.y > .5) {
				particle.size.y *= 0.95;
				particle.vel.y *= 0.10;
			}

			let deltaX = particle.pos.x - (canvas.width/2);
			let deltaY = particle.pos.y - (canvas.height/2);

			// Make particle go towards the middle
			if (particle.pos.x > canvas.width/2) {
				particle.pos.x -= (particle.vel.len+deltaX/20);
			} else {
				particle.pos.x += (particle.vel.len-deltaX/20);
			}
			if (particle.pos.y > canvas.height/2) {
				particle.pos.y -= (particle.vel.len+deltaY/20);
			} else {
				particle.pos.y += (particle.vel.len-deltaY/20);
			}

			// If too close to the middle, replace particle
			if (deltaX > -2 && deltaX <= 2 &&
				  deltaY > -2 && deltaY <= 2) {
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

window.addEventListener('resize', (event) => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});
