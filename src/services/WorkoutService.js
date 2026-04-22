export class WorkoutService {
	static getStats(workouts = []) {
		const safe = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

		return {
			totalWorkouts: workouts.length,
			totalDistance: workouts.reduce((acc, w) => acc + safe(w.distance), 0),
			totalTime: workouts.reduce((acc, w) => acc + safe(w.duration), 0),
		};
	}
}
