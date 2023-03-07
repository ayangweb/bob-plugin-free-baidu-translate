var config = require("./config");
var { sliceText, getSign } = require("./utils");

function supportLanguages() {
	return config.languages.map(([language]) => language);
}

async function translate(query, completion) {
	try {
		const { text, detectFrom, detectTo } = query;

		// 获取请求参数中的语种
		const getLanguage = (detect) =>
			config.languages.find((language) => language[0] === detect)[1];

		// 来源语言
		const from = getLanguage(detectFrom);

		// 目标语言
		const to = getLanguage(detectTo);

		// 请求头参数
		const header = {
			Cookie: "BAIDUID=235053FB8DF5684D55B3CDF040B46281:FG=1",
		};

		const payload = await $http.get({
			url: "https://fanyi.baidu.com",
			header,
		});

		if (!payload?.data) throw new Error();

		const sign = payload.data.match(/window\.gtk\s*=\s*"([^"]+)"/)[1];
		const token = payload.data.match(/token\s*:\s*'([^']+)'/)[1];

		const result = await $http.post({
			url: `https://fanyi.baidu.com/v2transapi?from=${from}&to=${to}`,
			body: {
				query: text,
				from,
				to,
				simple_means_flag: 3,
				sign: getSign(sliceText(text), sign),
				token,
				domain: "common",
			},
			header,
		});

		if (!result?.data) throw new Error();

		const { errmsg, trans_result } = result.data;

		if (errmsg) throw new Error(errmsg);

		completion({
			result: {
				from,
				to,
				toParagraphs: trans_result.data.map(({ dst }) => dst),
			},
		});
	} catch ({ message }) {
		completion({
			error: {
				type: "unknown",
				message,
			},
		});
	}
}

module.exports = {
	supportLanguages,
	translate,
};
