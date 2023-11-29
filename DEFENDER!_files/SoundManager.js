"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


class SoundManager {

	buffers;

    constructor(ctx) 
	{
		var loader = new BufferLoader(ctx, [
			'assets/sounds/bulletFire.ogg',     			//0
			'assets/sounds/bulletZapped.ogg',				//1
			'assets/sounds/rockEvaporate.ogg',				//2
			'assets/sounds/rockSplit.ogg',					//3
			'assets/sounds/shipWarp.ogg',					//4
			'assets/sounds/death1.ogg',						//5
			'assets/sounds/death2.ogg',						//6
			'assets/sounds/expl1.ogg',						//7
			'assets/sounds/expl2.ogg',						//8
			'assets/sounds/lazer1.ogg',						//9
			'assets/sounds/lazer2.ogg',						//10
			'assets/sounds/lazer3.ogg',						//11
			'assets/sounds/Term2Theme.mp3',                 //12
			], (buffers) => {
				ctx.buffers = buffers;
				this.buffers = buffers;
			});

		loader.load();
	}

	makeSource = (buffer) => {
		var source = context.createBufferSource();
		var compressor = context.createDynamicsCompressor();
		var gain = context.createGain();
		gain.gain.value = 0.2;
		source.buffer = buffer;
		source.connect(gain);
		gain.connect(compressor);
		compressor.connect(context.destination);
		return source;
	};

	play = () => {
		const source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(audioCtx.destination);
		source.start();
	};

	playSound = (type, rounds, interval, loop, random) => {
		try
		{
			if (typeof random == 'undefined') {
				random = 0;
			}
			var time = context.currentTime;
			for (var i = 0; i < rounds; i++) {
				var source = this.makeSource(this.buffers[type]);
				if(loop) source.loop = true;
				source.playbackRate.value = 1 + Math.random();
				source.start(time + i * interval + Math.random() * random);
				if(type === 12)this.source = source;
			}
		}
		catch(err){
			console.dir(err,err.message)
		}
	}

	stopSound = () => {
		if (!this.source.stop)
			this.source.stop = source.noteOff;
		this.source.stop(0);
	}
}