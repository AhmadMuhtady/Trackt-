import { Workout } from './Workout.js';

export class Running extends Workout {
	type = 'running';
	icon = '🏃‍♂️';
	color = '#63ff9d';
	glow = 'rgba(99,255,157,0.8)';
	constructor(coords, distance, duration, cadence) {
		super(coords, distance, duration);
		this.cadence = cadence;
		this._calcPace();
		this._setDescription();
	}

	_calcPace() {
		this.pace = this.duration / this.distance;
		return this.pace;
	}
}
