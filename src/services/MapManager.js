import { BusEvent } from '../core/EventBus.js';

export class MapManager {
	#map;
	#mapZoom = 13;
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
		const { latitude } = position.coords;
		const { longitude } = position.coords;

		const coords = [latitude, longitude];
		this.#map = L.map('map').setView(coords, this.#mapZoom);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.#map);

		L.marker(coords).addTo(this.#map).bindPopup('YOU').openPopup();

		this.#map.on('click', (mapE) => {
			BusEvent.emit('map:click', mapE.latlng);
		});
	}

	_pinDetails(workout) {
		const myIcon = L.divIcon({
			html: `
    <div class="pin-wrapper">

      <div class="pin-label" style="border-left-color:${workout.color}">
        <span class="pin-icon">${workout.icon}</span>
        <span>${workout.description}</span>
      </div>

      <div class="pin-dot" style="background:${workout.color}; box-shadow:0 0 12px ${workout.glow}"></div>

    </div>
  `,
			className: '',
			iconAnchor: [20, 42],
		});
		workout.marker = L.marker(workout.coords, { icon: myIcon }).addTo(
			this.#map,
		);
	}
	_movetoPopup(workout) {
		this.#map.setView(workout.coords, this.#mapZoom, {
			animate: true,
			pan: {
				duration: 1,
			},
		});
	}
}
