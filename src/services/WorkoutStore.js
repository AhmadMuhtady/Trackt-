import { UIManager } from './UIManager.js';
export class WorkoutStore {
	constructor() {
		this.workouts = this.getWorkouts();
	}
	saveWorkouts() {
		localStorage.setItem('workouts', JSON.stringify(this.workouts));
	}

	getWorkouts() {
		const stored = localStorage.getItem('workouts');
		return stored ? JSON.parse(stored) : [];
	}

	reset() {
		this.workouts = [];
		this.saveWorkouts();
	}

	deleteWorkout(workoutId) {
		this.workouts = this.workouts.filter((workout) => workout.id !== workoutId);
		this.saveWorkouts();
		return this.workouts;
	}

	_saveToggleTheme() {}
}
