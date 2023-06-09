const { createConnection, getConnection } = require("typeorm");
//实体
import { Good } from "./entity/Entity";
const axios = require("axios");
const puppeteer = require("puppeteer");

//数据库连接
createConnection({
	type: "mysql",
	host: "localhost",
	port: 3306,
	username: "root",
	password: "2221754815",
	database: "my_spider",
	entities: [Good],
	synchronize: true,
	logging: false,
})
	.then(async (connection) => {
		console.log("DB start");
		// const goodRepository = connection.getRepository(Good);
		// let list = await goodRepository.find();
		// console.log("所有数据:\n" + list);
	})
	.catch((error) => {
		console.log(error);
	});

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
//轮播图url示例
//let imgUrlList = `https://image3.vipmro.net/goodsImg/999999/60241010/01818/201908271553/002a02!800800.jpg`;
//商品列表接口
//https://www.vipmro.com/ss/front-node/interface/goods/search/mall/v2/1/20?deliveryTime=&isSop=0&categoryId=&attrValueIds=&keyword=3M%E5%8F%A3%E7%BD%A9&sortFields=&sortFlags=&stock=&range=&platform=2&channel=2

(async function () {
	//打开浏览器
	const browser = await puppeteer.launch({
		headless: false,
	});
	//获取表链接
	const goodsRepository = getConnection().getRepository(Good);
	//获取信息并将其存入数据库
	async function getData(keyword, pageNum) {
		return new Promise<void>(async (resolve, reject) => {
			let searchUrl = `https://www.vipmro.com/ss?keyword=${keyword}`;
			let searchListUrl = `https://www.vipmro.com/ss/front-node/interface/goods/search/mall/v2/${pageNum}/20?keyword=${keyword}`;

			//获取商品列表
			return axios.get(searchListUrl).then((res) => {
				let goodsList = res.data.data.goodsList;
				// console.log(goodsList);
				//遍历商品列表
				goodsList.map(async (item, idx) => {
					//商品id
					const goodId = item.id;
					//获取商品信息
					const Data = (await getDataList(goodId)) as any;

					const good = new Good();
					good.carousels = Data.ImgList;
					good.name = item.goodsName;
					good.prices = item.salePrice;
					good.description = Data.Detail;
					good.tags = Data.Tags;
					good.attrs = Data.AttrList;
					goodsRepository.save(good);
				});
			});
		});
	}
	//打开页面抓取信息
	async function getDataList(id) {
		// const result = [];
		// axios.get("https://www.vipmro.com/product/80753682").then(async (res) => {
		// 	// console.log(res.data);
		// 	// let $ = cheerio.load(res.data);
		// 	// $(".vm-tiny-img").each((idx, item) => {
		// 	// 	console.log($(item).attr("src"));
		// 	// 	// res.push($(item).attr("src"));
		// 	// });
		// });
		return new Promise(async (resolve, reject) => {
			const page = await browser.newPage();
			await page.setDefaultNavigationTimeout(0);
			console.log("页面开启");
			await page.goto(`https://www.vipmro.com/product/${id}`);
			// await page.goto(`https://www.vipmro.com/ss?keyword=${keyword}`);
			const result = await page.evaluate(() => {
				let ImgList = [];
				const AttrList = [];
				//详情信息
				const Detail = document.querySelector(".body-product-detail").outerHTML;
				//规格参数
				const Attrs = document.querySelectorAll(
					".detail-attrs-right-attrs tbody tr td"
				);
				//轮播列表
				const imgDomList = document.querySelectorAll(".item .vm-tiny-img");
				//标签列表
				const tagList = [];
				//将图片加入列表
				for (let i = 0; i < imgDomList.length; i++) {
					let ImgDom = imgDomList[i] as HTMLImageElement;
					ImgList.push(ImgDom.src);
				}
				//将参数加入Map
				for (let i = 0; i < Attrs.length; i++) {
					console.log(Attrs[i].innerHTML);
					if (i % 2 == 0) {
						const map = {
							[Attrs[i].innerHTML.trim()]: Attrs[i + 1].innerHTML.trim(),
						};
						AttrList.push(map);
					} else {
						continue;
					}
				}
				//将标签加入列表
				const TagDomList = document.querySelectorAll(".m-prodsku-line a");
				for (let i = 0; i < TagDomList.length; i++) {
					console.log("11111111" + TagDomList[i]);
					tagList.push(TagDomList[i].innerHTML.trim());
				}
				return {
					ImgList: ImgList,
					Detail: Detail,
					AttrList: AttrList,
					Tags: tagList,
				};
			});
			await page.close();
			console.log("页面关闭");
			console.log(id);
			console.log(result);
			resolve(result);
		});
	}

	async function start() {
		for (let i = 0; i < 5; i++) {
			await getData("安全帽", i);
			console.log("over-------------------------------------------" + i);
		}
	}

	start();
})();
