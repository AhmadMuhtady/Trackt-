export class Formatter {
	static number(val) {
		if (typeof val !== 'number' || !Number.isFinite(val)) return '0';

		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(val);
	}
}
