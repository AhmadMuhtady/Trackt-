import { Workout } from './Workout.js';

export class Cycling extends Workout {
	type = 'cycling';
	icon = '🚴‍♀️';
	color = '#f9b040';
	glow = 'rgba(249,176,64,0.8)';
	constructor(coords, distance, duration, elevationGain) {
		super(coords, distance, duration);
		this.elevationGain = elevationGain;
		this._calcSpeed();
		this._setDescription();
	}

	_calcSpeed() {
		this.speed = this.distance / (this.duration / 60);
		return this.speed;
	}
}
