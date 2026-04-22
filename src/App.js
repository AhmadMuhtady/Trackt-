import { BusEvent } from './core/EventBus.js';
import { WorkoutManager } from './core/WorkoutManager.js';
import { MapManager } from './services/MapManager.js';
import { UIManager } from './services/UIManager.js';
import { WorkoutStore } from './services/WorkoutStore.js';

class App {
	constructor() {
		this.store = new WorkoutStore();
		this.map = new MapManager();
		this.ui = new UIManager();
		this.manager = new WorkoutManager(this.store, this.map, this.ui);
	}
}

const app = new App();
