import { Running } from '../models/Running.js';
import { Cycling } from '../models/Cycling.js';

export class WorkoutStore {
	constructor() {
		// 1. Get the raw data and turn them back into Class instances
		this.workouts = this._loadAndRestore();
	}

	_loadAndRestore() {
		const data = JSON.parse(localStorage.getItem('workouts'));
		if (!data) return [];

		// 2. Map through the raw objects and create new Class instances
		return data.map((work) => {
			let instance;
			if (work.type === 'running') {
				instance = new Running(
					work.coords,
					work.distance,
					work.duration,
					work.cadence,
				);
			} else {
				instance = new Cycling(
					work.coords,
					work.distance,
					work.duration,
					work.elevationGain,
				);
			}

			// Restore original id and date
			instance.id = work.id;
			instance.date = new Date(work.date);
			instance._setDescription(); // ← recalculate description with correct date

			return instance;
		});
	}

	addWorkout(workout) {
		this.workouts.push(workout);
		this.saveWorkouts();
	}

	saveWorkouts() {
		const data = this.workouts.map(({ marker, ...workout }) => workout);
		localStorage.setItem('workouts', JSON.stringify(data));
	}

	reset() {
		this.workouts = [];
		localStorage.removeItem('workouts');
	}

	deleteWorkout(workoutId) {
		this.workouts = this.workouts.filter((w) => w.id !== workoutId);
		this.saveWorkouts();
		return this.workouts;
	}
}
