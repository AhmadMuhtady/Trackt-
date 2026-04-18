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
  <div style="display:flex; flex-direction:column; align-items:center">

  <!-- Label card -->
  <div style="background:#182127; border-left:4px solid ${workout.color}; padding:6px 12px; border-radius:10px; margin-bottom:6px">
    <p style="color:white; font-size:12px; white-space:nowrap">
      ${workout.icon} ${workout.description}
    </p>
  </div>

  <!-- Glowing dot -->
  <div style="width:14px; height:14px; background:${workout.color}; border-radius:50%; box-shadow:0 0 15px ${workout.glow}">
  </div>

</div>`,

			className: '',
			iconAnchor: [16, 16],
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
