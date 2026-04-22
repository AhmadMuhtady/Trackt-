class EventBus {
	storage = {};

	on(eventName, callback) {
		if (!this.storage[eventName]) {
			this.storage[eventName] = [];
		}

		if (!this.storage[eventName].includes(callback)) {
			this.storage[eventName].push(callback);
		}
	}

	emit(eventName, data) {
		const events = this.storage[eventName];

		if (!events) return;

		events.forEach((callback) => {
			callback(data);
		});
	}

	off(eventName, callback) {
		const events = this.storage[eventName];
		if (!events) return;

		this.storage[eventName] = events.filter((cb) => cb !== callback);
	}
}

export const BusEvent = new EventBus();

// ============================================
// EventBus.js — The Radio Station
// ============================================
// PURPOSE:
// Decouples all classes from each other.
// No class talks directly to another —
// they communicate through the EventBus.
//
// PATTERN: Singleton
// One instance exported ready to use.
// import { BusEvent } from './EventBus.js'
//
// INTERNAL STORAGE:
// storage = {
//   'workout:created': [callbackA, callbackB],
//   'workout:deleted': [callbackC],
// }
//
// METHODS:
// on(event, callback) → Subscribe/listen to an event
// emit(event, data)   → Broadcast an event to all listeners
//
// WHO CALLS WHAT:
// UIManager     → BusEvent.on('workout:created', ...)
// MapManager    → BusEvent.on('workout:created', ...)
// WorkoutManager → BusEvent.emit('workout:created', workout)
//
// WHY:
// WorkoutManager doesn't need to know UIManager
// or MapManager exist — it just emits, and
// whoever is listening reacts. 🎯
// ============================================
