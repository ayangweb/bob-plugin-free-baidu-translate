// 引入 koa 框架
const Koa = require("koa2");

// 引入处理 post 数据的插件
const bodyParser = require("koa-bodyparser");

// 引入 koa 路由
const KoaRouter = require("koa-router");

// 引入 axios
const axios = require("axios");

// 引入自定义方法
const { sliceText, getSign } = require("./utils");

// 创建服务器实例
const app = new Koa();

// 创建路由实例
const router = new KoaRouter();

// 使用bodyParser
app.use(bodyParser());

// 使用路由
app.use(router.routes(), router.allowedMethods());

// 监听端口
app.listen("5678", () => {
	console.log("端口号为 5678 的服务器已经启动！");
});

// 翻译 api
router.post("/translate", async (ctx) => {
	// body 传 query(所译文本)、from(来源语言) 和 to(目标语言)
	const { body } = ctx.request;

	const { query, from, to } = body;

	const { data: payload } = await axios.get(
		`https://fanyi.baidu.com/#${from}/${to}/${query}`,
		{
			headers: {
				Cookie: "BAIDUID=235053FB8DF5684D55B3CDF040B46281:FG=1",
			},
		}
	);

	const sign = payload.match(/window\.gtk\s*=\s*"([^"]+)"/)[1];
	const token = payload.match(/token\s*:\s*'([^']+)'/)[1];

	const { data } = await axios.post(
		`https://fanyi.baidu.com/v2transapi?from=${from}&to=${to}`,
		{
			...body,
			simple_means_flag: 3,
			sign: getSign(sliceText(query), sign),
			token,
			domain: "common",
		},
		{
			headers: {
				Cookie: "BAIDUID=235053FB8DF5684D55B3CDF040B46281:FG=1",
			},
		}
	);

	const { errmsg, trans_result } = data;

	if (errmsg) ctx.body = errmsg;

	ctx.body = trans_result.data.map(({ dst }) => dst);
});
