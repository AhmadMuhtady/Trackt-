import { BusEvent } from '../core/EventBus.js';

export class MapManager {
	#map;
	#mapZoom = 13;
	#minZoom = 3;
	#maxZoom = 19;
	#markers = [];
	#currentLayer = null;

	constructor() {
		this._getPosition();
	}

	_getPosition() {
		if (navigator.geolocation)
			navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
				alert('Could not get your current Location'),
			);
	}

	_loadMap(position) {
		const { latitude, longitude } = position.coords;
		const coords = [latitude, longitude];

		this.#map = L.map('map', {
			minZoom: this.#minZoom,
			maxZoom: this.#maxZoom,
		}).setView(coords, this.#mapZoom);

		const savedLayer = localStorage.getItem('mapLayer') || 'street';
		this._switchLayer(savedLayer);

		L.marker(coords).addTo(this.#map).bindPopup('YOU').openPopup();

		// 1. Listen for clicks to open the form
		this.#map.on('click', (mapE) => {
			const { lat, lng } = mapE.latlng;
			BusEvent.emit('map:click', [lat, lng]);
		});

		document.getElementById('map-confiq').addEventListener('click', (e) => {
			const btn = e.target.closest('[data-zoom]');
			if (!btn) return;

			const action = btn.dataset.zoom;

			if (action === 'in') this.#map.zoomIn();
			if (action === 'out') this.#map.zoomOut();
			if (action === 'my-location')
				this.#map.locate({
					setView: true,
					maxZoom: this.#mapZoom,
				});
		});

		// 2. FIXED: Listen for created workouts OUTSIDE the click handler
		// This ensures we only have ONE listener for the whole app session
		BusEvent.on('workout:created', (workout) => {
			this._pinDetails(workout);
			this._movetoPopup(workout);
		});

		// 3. Listen for selection (when user clicks a workout in the sidebar)
		BusEvent.on('workout:select', (id) => {
			// You'll need logic here to find the workout by ID if you want to pan to it
		});

		BusEvent.emit('map:ready');

		BusEvent.on('workout:deleted', (id) => {
			this._removeMarker(id);
		});

		BusEvent.on('workouts:reset', () => {
			this._clearMarkers();
		});

		BusEvent.on('markers:clear', () => this._clearMarkers());
		BusEvent.on('marker:pin', (workout) => this._pinDetails(workout));
		BusEvent.on('layer:change', (name) => this._switchLayer(name));
	}

	_pinDetails(workout) {
		const myIcon = L.divIcon({
			html: `
      <div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full">
        <!-- The Label (Popup look) -->
        <div class="bg-[#2d3436] px-4 py-2 rounded-xl shadow-2xl border-l-4 backdrop-blur-md mb-2 flex items-center gap-2" 
             style="border-color: ${workout.color};">
          <p class="text-xs font-bold text-white whitespace-nowrap">
            ${workout.icon} ${workout.description}
          </p>
        </div>
        
        <!-- The Dot (Pin) -->
        <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg" 
             style="background-color: ${workout.color}; box-shadow: 0 0 15px ${workout.glow || workout.color};">
        </div>
      </div>
    `,
			className: '', // Keeping this empty removes default Leaflet marker borders/backgrounds
			iconSize: [0, 0], // Prevents Leaflet from forcing a box size
			iconAnchor: [0, 0], // Centers the injection point
		});

		workout.marker = L.marker(workout.coords, { icon: myIcon }).addTo(
			this.#map,
		);

		this.#markers.push({ id: workout.id, marker: workout.marker });
	}

	_movetoPopup(workout) {
		this.#map.setView(workout.coords, this.#mapZoom, {
			animate: true,
			pan: {
				duration: 1,
			},
		});
	}

	_clearMarkers() {
		this.#markers.forEach((m) => m.marker.remove());
		this.#markers = [];
	}

	_removeMarker(id) {
		const found = this.#markers.find((m) => m.id === id);
		if (!found) return;
		found.marker.remove();
		this.#markers = this.#markers.filter((m) => m.id !== id);
	}

	_switchLayer(name) {
		const layers = {
			street: {
				url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			},
			satellite: {
				url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
			},
			terrain: {
				url: 'https://tile.opentopomap.org/{z}/{x}/{y}.png',
				attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
			},
		};

		if (this.#currentLayer) this.#currentLayer.remove();

		this.#currentLayer = L.tileLayer(layers[name].url, {
			attribution: layers[name].attribution,
		}).addTo(this.#map);

		localStorage.setItem('mapLayer', name);
	}
}
