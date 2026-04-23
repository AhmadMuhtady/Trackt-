import { BusEvent } from '../core/EventBus.js';
import { WorkoutService } from './WorkoutService.js';
import { Formatter } from './Formatter.js';

export class UIManager {
	constructor() {
		this._init();
		this._initListeners();

		this.isModalOpen = false;
		this.isSortOpen = false;
		this.isFilterOpen = false;
	}

	_init() {
		this.form = document.getElementById('form');
		this.containerWorkouts = document.getElementById('workout-list');

		this.statsWorkout = document.getElementById('stats-workouts');
		this.statsDistance = document.getElementById('stat-distance');
		this.statsTime = document.getElementById('stat-time');

		this.sortBtn = document.getElementById('sort-btn');
		this.sortDropdown = document.getElementById('sort-dropdown');

		this.filterBtn = document.getElementById('filter-btn');
		this.filterDropdown = document.getElementById('filter-dropdown');

		this.inputCadenceRow = document.getElementById('input-cadence-row');
		this.inputElevationRow = document.getElementById('input-elevation-row');

		this.inputType = document.getElementById('input-type');
		this.inputDistance = document.getElementById('input-distance');
		this.inputDuration = document.getElementById('input-duration');
		this.inputCadence = document.getElementById('input-cadence');
		this.inputElevation = document.getElementById('input-elevation');

		this.clearBtn = document.getElementById('btn-clear');
		this.themeToggleBtn = document.getElementById('themeToggle-btn');
		this.themeIcon = this.themeToggleBtn.querySelector('span');

		this.infoBtn = document.getElementById('info-btn');
		this.closeModalBtn = document.getElementById('closeInfo');
		this.modal = document.getElementById('info-modal');

		this.nav = document.querySelector('nav');

		this._applySavedTheme();
		this._updateThemeIcon();
		this.selectedCoords = null;
	}

	_initListeners() {
		this.form.addEventListener('submit', (e) => {
			e.preventDefault();

			if (!this.selectedCoords) {
				return alert('Please click on the map to choose a location first!');
			}

			const data = this._getFormData();

			if (!this._validateFormData(data)) {
				return alert('Input needs to be a positive number');
			}

			BusEvent.emit('form:submit', {
				coords: this.selectedCoords,
				...data,
			});

			this._hideForm();
		});

		this.inputType.addEventListener('change', this._toggleType.bind(this));

		this.clearBtn.addEventListener('click', this._reset.bind(this));
		this.themeToggleBtn.addEventListener('click', this._toggleTheme.bind(this));
		this.infoBtn.addEventListener('click', this._showModal.bind(this));
		this.closeModalBtn.addEventListener('click', this._hideModal.bind(this));

		this.sortBtn.addEventListener('click', () => {
			this.isSortOpen = !this.isSortOpen;
			this.sortDropdown.classList.toggle('hidden');
		});

		this.filterBtn.addEventListener('click', () => {
			this.isFilterOpen = !this.isFilterOpen;
			this.filterDropdown.classList.toggle('hidden');
		});

		this.sortDropdown.addEventListener('click', (e) => {
			const btn = e.target.closest('button');
			if (!btn) return;

			BusEvent.emit('sort:change', {
				sort: btn.dataset.sort,
				order: btn.dataset.order,
			});

			this._closeSort();
		});

		this.filterDropdown.addEventListener('click', (e) => {
			const btn = e.target.closest('button');
			if (!btn) return;

			BusEvent.emit('date:filter', btn.dataset.dateFilter);

			this._closeFilter();
		});

		this.nav.addEventListener('click', (e) => {
			const tab = e.target.closest('[data-filter]');
			if (!tab) return;

			BusEvent.emit('workouts:filter', tab.dataset.filter);
		});

		this.containerWorkouts.addEventListener('click', (e) => {
			const deleteBtn = e.target.closest('.btn-delete');
			if (deleteBtn) {
				const item = deleteBtn.closest('[data-id]');
				BusEvent.emit('workout:delete', item.dataset.id);
				return;
			}

			const editBtn = e.target.closest('.btn-edit');
			if (editBtn) {
				const item = editBtn.closest('[data-id]');
				BusEvent.emit('workout:edit', item.dataset.id);
				return;
			}

			const item = e.target.closest('[data-id]');
			if (!item) return;
			BusEvent.emit('workout:select', item.dataset.id);
		});

		document.addEventListener('click', (e) => this._handleClickOutside(e));

		BusEvent.on('map:click', (latlng) => this._showForm(latlng));
		BusEvent.on('workout:created', (workout) => this._renderWorkout(workout));
		BusEvent.on('workout:deleted', (id) => this._removeWorkout(id));
		BusEvent.on('stats:updated', (workouts) => this._updateStats(workouts));
		BusEvent.on('workouts:rerender', (workouts) => this._rerenderAll(workouts));
		BusEvent.on('workout:editForm', (workout) =>
			this._editWorkoutForm(workout),
		);
	}

	_toggleType() {
		const type = this.inputType.value;

		const running = type === 'running';

		this.inputCadenceRow.classList.toggle('hidden', !running);
		this.inputElevationRow.classList.toggle('hidden', running);
	}

	_applySavedTheme() {
		const saved = localStorage.getItem('theme');

		document.documentElement.classList.toggle('dark', saved === 'dark');
	}

	_updateThemeIcon() {
		const isDark = document.documentElement.classList.contains('dark');
		this.themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
	}

	_toggleTheme() {
		const isDark = document.documentElement.classList.toggle('dark');

		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		this._updateThemeIcon();
	}

	_showModal() {
		this.modal.classList.remove('hidden');
		this.modal.classList.add('flex');
		this.isModalOpen = true;
	}

	_hideModal() {
		this.modal.classList.add('hidden');
		this.modal.classList.remove('flex');
		this.isModalOpen = false;
	}

	_closeSort() {
		this.sortDropdown.classList.add('hidden');
		this.isSortOpen = false;
	}

	_closeFilter() {
		this.filterDropdown.classList.add('hidden');
		this.isFilterOpen = false;
	}

	_handleClickOutside(e) {
		const clickedSort = this.sortBtn.contains(e.target);
		const clickedSortMenu = this.sortDropdown.contains(e.target);

		const clickedFilter = this.filterBtn.contains(e.target);
		const clickedFilterMenu = this.filterDropdown.contains(e.target);

		const clickedModal = this.modal.contains(e.target);
		const clickedModalBtn = this.infoBtn.contains(e.target);

		if (this.isSortOpen && !clickedSort && !clickedSortMenu) {
			this._closeSort();
		}

		if (this.isFilterOpen && !clickedFilter && !clickedFilterMenu) {
			this._closeFilter();
		}

		if (this.isModalOpen && !clickedModal && !clickedModalBtn) {
			this._hideModal();
		}
	}

	_reset() {
		BusEvent.emit('workouts:reset');
	}

	_showForm(latlng) {
		if (
			Array.isArray(latlng) &&
			latlng.length === 2 &&
			latlng.every((item) => Number.isFinite(item))
		) {
			this.selectedCoords = latlng;
		}

		this.form.classList.remove('hidden');
		this.inputDistance.focus();
	}

	_hideForm() {
		this.inputDistance.value =
			this.inputDuration.value =
			this.inputCadence.value =
			this.inputElevation.value =
				'';

		this.selectedCoords = null;

		this.form.classList.add('hidden');
	}

	_renderWorkout(workout) {
		let html = `
		<div
			class="workout workout--${workout.type} relative group bg-[#3b444b] p-5 rounded-xl border-l-[5px] shadow-xl hover:translate-x-1 transition-all cursor-pointer"
			style="border-color: ${workout.color};"
			data-id="${workout.id}"
		>
			<div class="flex justify-between items-start mb-4">
				<h2 class="workout__title text-white font-bold text-base leading-tight">
					${workout.description}
				</h2>

				<button class="btn-edit opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-primary">                
          <span class="material-symbols-outlined text-sm">edit</span>
        </button>

				<button class="btn-delete opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error">
					<span class="material-symbols-outlined text-sm">close</span>
				</button>
			</div>

			<div class="grid grid-cols-2 gap-y-4">
				<div class="flex items-baseline gap-2">
					<span class="workout__icon text-xl">${workout.icon}</span>
					<span class="workout__value text-lg font-extrabold text-white">
						${workout.distance}
					</span>
					<span class="workout__unit text-[10px] uppercase font-bold text-on-surface-variant">
						km
					</span>
				</div>

				<div class="flex items-baseline gap-2">
					<span class="workout__icon text-xl">⏱</span>
					<span class="workout__value text-lg font-extrabold text-white">
						${workout.duration}
					</span>
					<span class="workout__unit text-[10px] uppercase font-bold text-on-surface-variant">
						min
					</span>
				</div>
	`;

		// RUNNING
		if (workout.type === 'running') {
			html += `
			<div class="flex items-baseline gap-2">
				<span class="workout__icon text-xl">⚡️</span>
				<span class="workout__value text-lg font-extrabold text-white">
					${workout.pace.toFixed(1)}
				</span>
				<span class="workout__unit text-[10px] uppercase font-bold text-on-surface-variant">
					min/km
				</span>
			</div>

			<div class="flex items-baseline gap-2">
				<span class="workout__icon text-xl">🦶🏼</span>
				<span class="workout__value text-lg font-extrabold text-white">
					${workout.cadence}
				</span>
				<span class="workout__unit text-[10px] uppercase font-bold text-on-surface-variant">
					spm
				</span>
			</div>
		`;
		}

		// CYCLING
		if (workout.type === 'cycling') {
			html += `
			<div class="flex items-baseline gap-2">
				<span class="workout__icon text-xl">⚡️</span>
				<span class="workout__value text-lg font-extrabold text-white">
					${workout.speed.toFixed(1)}
				</span>
				<span class="workout__unit text-[10px] uppercase font-bold text-on-surface-variant">
					km/h
				</span>
			</div>

			<div class="flex items-baseline gap-2">
				<span class="workout__icon text-xl">⛰</span>
				<span class="workout__value text-lg font-extrabold text-white">
					${workout.elevationGain}
				</span>
				<span class="workout__unit text-[10px] uppercase font-bold text-on-surface-variant">
					m
				</span>
			</div>
		`;
		}

		html += `
			</div>
		</div>
	`;

		this.containerWorkouts.insertAdjacentHTML('beforeend', html);
	}

	_updateStats(workouts) {
		if (!Array.isArray(workouts)) return;

		const stats = WorkoutService.getStats(workouts);

		this.statsWorkout.textContent = stats.totalWorkouts;

		this.statsDistance.innerHTML = `${Formatter.number(stats.totalDistance)}<span class="text-xs ml-0.5 text-on-surface-variant">km</span>`;

		this.statsTime.innerHTML = `${Formatter.number(stats.totalTime)}<span class="text-xs ml-0.5 text-on-surface-variant">min</span>`;
	}

	_removeWorkout(id) {
		const workoutEl = document.querySelector(`[data-id="${id}"]`);

		if (!workoutEl) return;

		workoutEl.remove();
	}

	_rerenderAll(workouts) {
		const workoutsEl = document.querySelectorAll('.workout');
		workoutsEl.forEach((el) => el.remove());

		workouts.forEach((workout) => this._renderWorkout(workout));
	}

	_getFormData() {
		const type = this.inputType.value;
		const distance = +this.inputDistance.value;
		const duration = +this.inputDuration.value;
		const cadence = +this.inputCadence.value;
		const elevation = +this.inputElevation.value;

		return { type, distance, duration, cadence, elevation };
	}

	_validateFormData(data) {
		const isFinite = (...vals) => vals.every(Number.isFinite);
		const isPositive = (...vals) => vals.every((v) => v > 0);

		if (data.type === 'running') {
			return (
				isFinite(data.distance, data.duration, data.cadence) &&
				isPositive(data.distance, data.duration, data.cadence)
			);
		}

		if (data.type === 'cycling') {
			return (
				isFinite(data.distance, data.duration, data.elevation) &&
				isPositive(data.distance, data.duration)
			);
		}

		return false;
	}

	_editWorkoutForm(workout) {
		this._showForm(workout.coords);

		this.inputType.value = workout.type;
		this.inputDistance.value = workout.distance;
		this.inputDuration.value = workout.duration;
		if (workout.type === 'running') {
			this.inputCadence.value = workout.cadence;
		} else {
			this.inputElevation.value = workout.elevationGain;
		}

		this._toggleType();
	}
}
