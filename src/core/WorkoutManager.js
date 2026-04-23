import { BusEvent } from './EventBus.js';
import { Running } from '../models/Running.js';
import { Cycling } from '../models/Cycling.js';

export class WorkoutManager {
	//   'form:submit'
	// 'workout:delete'
	// 'workout:select'
	// 'workouts:reset'
	// 'sort:change'
	// 'date:filter'
	// 'workouts:filter'
	constructor(store, map, ui) {
		this.store = store;
		this.map = map;
		this.ui = ui;
		this.editingId = null;

		BusEvent.on('map:ready', () => {
			this.store.workouts.forEach((workout) => {
				BusEvent.emit('workout:created', workout);
			});
			// Also tell UI to show the list and stats
			BusEvent.emit('stats:updated', this.store.workouts);
		});

		// 3. Handle Deletion
		BusEvent.on('workout:delete', (id) => {
			this._deleteWorkout(id);
		});

		// 2. Handle New Workout
		BusEvent.on('form:submit', (data) => {
			this._newWorkout(data);
		});
		// 4. Handle Selection (Clicking an item in the sidebar)
		BusEvent.on('workout:select', (id) => {
			this._selectWorkout(id);
		});

		BusEvent.on('workouts:reset', () => {
			this._reset();
		});

		BusEvent.on('sort:change', (data) => this._sortWorkout(data));
		BusEvent.on('workouts:filter', (data) => this._filterWorkout(data));
		BusEvent.on('date:filter', (data) => this._dateFilter(data));
		BusEvent.on('workout:edit', (id) => {
			this._editWorkout(id);
		});
	}

	_newWorkout(data) {
		if (this.editingId) {
			const original = this.store.workouts.find((w) => w.id === this.editingId);
			const { type, coords, distance, duration, cadence, elevation } = data;
			const updatedWorkout =
				type === 'running'
					? new Running(coords, distance, duration, cadence)
					: new Cycling(coords, distance, duration, elevation);
			updatedWorkout.id = original.id;
			updatedWorkout.date = original.date;
			updatedWorkout._setDescription();

			const index = this.store.workouts.findIndex(
				(obj) => obj.id === original.id,
			);
			if (index !== -1) this.store.workouts.splice(index, 1, updatedWorkout);

			this.store.saveWorkouts();
			BusEvent.emit('workouts:rerender', this.store.workouts);
			BusEvent.emit('stats:updated', this.store.workouts);
			BusEvent.emit('markers:clear');

			BusEvent.emit('markers:clear');
			this.store.workouts.forEach((w) => BusEvent.emit('marker:pin', w));
			this.editingId = null;
		} else {
			const { type, coords, distance, duration, cadence, elevation } = data;
			const workout =
				type === 'running'
					? new Running(coords, distance, duration, cadence)
					: new Cycling(coords, distance, duration, elevation);

			this.store.addWorkout(workout);
			BusEvent.emit('workout:created', workout);
			BusEvent.emit('stats:updated', this.store.workouts);
		}
	}

	_deleteWorkout(id) {
		const updatedWorkouts = this.store.deleteWorkout(id);
		BusEvent.emit('workout:deleted', id);
		BusEvent.emit('stats:updated', updatedWorkouts);
	}

	_selectWorkout(id) {
		const workout = this.store.workouts.find((w) => w.id === id);
		if (!workout) return;
		this.map._movetoPopup(workout);
	}

	_sortWorkout(data) {
		const sorted = this.store.workouts
			.slice()
			.sort((a, b) =>
				data.order === 'asc'
					? a[data.sort] - b[data.sort]
					: b[data.sort] - a[data.sort],
			);
		BusEvent.emit('workouts:rerender', sorted);
		BusEvent.emit('stats:updated', sorted);
	}

	_filterWorkout(type) {
		const filtered =
			type === 'all'
				? this.store.workouts
				: this.store.workouts.filter((w) => w.type === type);
		BusEvent.emit('workouts:rerender', filtered);
		BusEvent.emit('stats:updated', filtered);
	}

	_dateFilter(order) {
		const sorted = this.store.workouts
			.slice()
			.sort((a, b) =>
				order === 'newest'
					? new Date(b.date) - new Date(a.date)
					: new Date(a.date) - new Date(b.date),
			);
		BusEvent.emit('workouts:rerender', sorted);
		BusEvent.emit('stats:updated', sorted);
	}

	_editWorkout(id) {
		const workout = this.store.workouts.find((w) => w.id === id);
		if (!workout) return;
		this.editingId = id;
		BusEvent.emit('workout:editForm', workout);
	}

	_reset() {
		this.store.reset();
		BusEvent.emit('workouts:rerender', []);
		BusEvent.emit('stats:updated', []);
	}
}
