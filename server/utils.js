function sliceText(text) {
	if (text.length <= 30) return text;

	const midIndex = Math.floor(text.length / 2);

	return (
		text.slice(0, 10) +
		text.slice(midIndex - 5, midIndex + 5) +
		text.slice(-10)
	);
}

function aB(a, b) {
	for (var c = 0; c < b.length - 2; c += 3) {
		var d = b.charAt(c + 2);
		d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
		d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
		a = "+" == b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
	}
	return a;
}

function getSign(a, b) {
	if (b === undefined) return;

	var d = b.split(".");

	b = Number(d[0]) || 0;

	for (var e = [], f = 0, g = 0; g < a.length; g++) {
		var k = a.charCodeAt(g);
		128 > k
			? (e[f++] = k)
			: (2048 > k
					? (e[f++] = (k >> 6) | 192)
					: (55296 == (k & 64512) &&
					  g + 1 < a.length &&
					  56320 == (a.charCodeAt(g + 1) & 64512)
							? ((k =
									65536 +
									((k & 1023) << 10) +
									(a.charCodeAt(++g) & 1023)),
							  (e[f++] = (k >> 18) | 240),
							  (e[f++] = ((k >> 12) & 63) | 128))
							: (e[f++] = (k >> 12) | 224),
					  (e[f++] = ((k >> 6) & 63) | 128)),
			  (e[f++] = (k & 63) | 128));
	}
	a = b;
	for (f = 0; f < e.length; f++) a = aB(a + e[f], "+-a^+6");
	a = aB(a, "+-3^+b+-f");
	a ^= Number(d[1]) || 0;
	0 > a && (a = (a & 2147483647) + 2147483648);
	a %= 1e6;
	return a.toString() + "." + (a ^ b);
}

module.exports = {
	sliceText,
	getSign,
};
