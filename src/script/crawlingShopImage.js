const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const db = require('../db/db');
const { shopDB } = require('../db');

process.setMaxListeners(500);

// 기획분들과의 공유를 위해 csv파일로 데이터 저장
const csvWriter = createCsvWriter({
  path: 'shopImg.csv',
  header: [
    { id: 'shopId', title: '소품샵 id' },
    { id: 'shopName', title: '소품샵 이름' },
    { id: 'image', title: '소품샵 이미지' },
    { id: 'isPreview', title: '대표 사진 여부' },
  ],
});

const getImage = async (shopId) => {
  console.log('shopId>>>shopId', shopId);
  const browser = await puppeteer.launch(); // headless 브라우저 실행
  const page = await browser.newPage(); // 새로운 페이지 열기
  await page.setJavaScriptEnabled(true);
  await page.goto(`https://pcmap.place.naver.com/place/${shopId}/photo?from=map&fromPanelNum=2&ts=1643486241723&filterType=%EC%97%85%EC%B2%B4%EC%82%AC%EC%A7%84`, {
    waitUntil: 'networkidle0',
  });

  try {
    await page.waitForSelector('._3TiO6', { visible: true, timeout: 50000 });
    const content = await page.content();
    const $ = cheerio.load(content);
    const $img = $('img');
    const imgSources = [];
    $img.each((_, elem) => {
      imgSources.push(elem.attribs.src);
    });

    return imgSources;
  } catch (err) {
    console.log(err);
    return 'no image';
  }
};

const getShopIdFromUrl = (url) => {
  const splitUrl = url.split('/');
  const paramAndQuery = splitUrl[splitUrl.length - 1].split('?');
  const shopId = paramAndQuery[0];
  return shopId;
};

const ExecuteCrawling = async (keyword, id) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage(); // 새로운 페이지 열기
  await page.setJavaScriptEnabled(true);
  await page.goto(`https://map.naver.com/v5/search/${keyword}?c=14137173.7122868,4521234.4977928,15,0,0,0,dh`, { waitUntil: 'networkidle0' });

  const resultObj = {
    shopName: keyword,
    shopId: id,
    img: [],
  };

  try {
    const frameUrl = await page.frames()[0]._url;
    const shopId = getShopIdFromUrl(frameUrl);
    if (typeof shopId === 'number') {
      const imageArray = await getImage(shopId);
      await browser.close();
      // console.log('imageArray', imageArray);
      resultObj.img = imageArray;
      return resultObj;
    } else {
      // 리스트 요소 중 첫번째를 클릭한 이후 shopId에 해당하는 돔 찾기
      const elementHandle = await page.$('#searchIframe');
      const searchResultFrame = await elementHandle.contentFrame();
      await searchResultFrame.waitForSelector('a._3LMxZ:first-child', { visible: true, timeout: 50000 });
      await searchResultFrame.click('a._3LMxZ:first-child');

      await page.waitForSelector('#entryIframe', { visible: true, timeout: 50000 });

      const entryIframe = await page.$('#entryIframe');
      const shopInfoIframe = await entryIframe.contentFrame();
      const shopInfoIframeUrl = shopInfoIframe._frameManager._mainFrame._url;
      const newShopId = getShopIdFromUrl(shopInfoIframeUrl);
      const imageArray = await getImage(newShopId);
      await browser.close();
      // console.log('imageArray', imageArray);
      resultObj.img = imageArray;
      return resultObj;
    }
  } catch (err) {
    resultObj.img = '[SUCCESS] timeout err';
    return resultObj;
  }
};

const insertShopImageDataToDb = async (shopImgObj, client) => {
  console.log('들어온 객체 데이터', shopImgObj);
  if (typeof shopImgObj.img === 'string') {
    return '[SUCCESS] no image Data';
  }

  for (let i = 0; i <= 3; i++) {
    if (!shopImgObj.img[i]) {
      break;
    }
    const shopId = Number(shopImgObj.shopId);
    let isPreview = false;
    if (i === 0) {
      isPreview = true;
    } else {
      isPreview = false;
    }

    const shopImg = shopImgObj.img[i];
    const shopImgInfo = await shopDB.insertShopImage(client, shopId, shopImg, isPreview);
    console.log('insert return value', shopImgInfo);
    const shopImageArr = [
      {
        shopId: shopImgInfo[0].shopId,
        shopName: shopImgObj.shopName,
        image: shopImgInfo[0].image,
        isPreview,
      },
    ];
    csvWriter.writeRecords(shopImageArr).then(() => console.log('[SUCCESS] CSV file was written successfully'));
  }
  return '[SUCCESS] insert image Data';
};

const connectWithDb = async () => {
  let client;
  // 1. shopId와 shopName 가져오기
  try {
    client = await db.connect();
    const shopInfo = await shopDB.getAllShopNameAndShopId(client);

    // 비동기적 로직 => 요청수 제한으로 인해 rejected가 많음. TODO 재귀적 해결방안 찾아보기
    /*const haveTermExecuteCrawling = (shopName, shopId) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(ExecuteCrawling(shopName, shopId));
        }, 150000);
      });
    };

    const imagePromiseList = tempList.map((item) => {
      return haveTermExecuteCrawling(item.shopName, item.shopId);
    });

    const shopImageArr = [];
    await Promise.allSettled(imagePromiseList).then((image) => {
      image.map((result) => {
        if (result.status === 'fulfilled') {
          console.log('image', result.value);
          shopImageArr.push(result.value);
        } else {
          console.log('[ERROR] Promise status rejected');
          shopImageArr.push([]);
        }
      });
    });*/

    // 동기적 로직
    const shopImageJson = {};

    for (const shop of shopInfo) {
      const shopImageObj = await ExecuteCrawling(shop.shopName, shop.shopId);
      const isInsertSuccess = await insertShopImageDataToDb(shopImageObj, client);
      console.log('isInsertSuccess?', isInsertSuccess);
      shopImageJson[shop.shopId] = shopImageObj;
    }

    // 디버깅을 위해 json파일로 데이터 저장
    fs.writeFile('shopImg.json', JSON.stringify(shopImageJson), (err) => {
      if (err) {
        console.log('[ERROR] file write err', err);
      } else {
        console.log('[SUCCESS] file write success');
      }
    });
  } catch (err) {
    console.log('err', err);
  } finally {
    client.release();
  }
};

connectWithDb();
