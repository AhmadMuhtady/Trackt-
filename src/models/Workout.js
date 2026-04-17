export class Workout {
	months = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	id = crypto.randomUUID();
	date = new Date();
	constructor(coords, distance, duration) {
		this.coords = coords;
		this.distance = distance;
		this.duration = duration;
	}

	_setDescription() {
		this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${this.months[this.date.getMonth()]} ${this.date.getDate()}`;
	}
}
